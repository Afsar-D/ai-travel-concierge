from fastapi import APIRouter, Depends, HTTPException
from app.agent.state import AgentState
from app.agent.graph import travel_agent
from app.schema.chat import ChatRequest, ChatResponse
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import desc, select, col
import uuid
from datetime import datetime
from app.database.session import get_session
from app.database.models import ChatMessages, ChatSession, FlightBooking, HotelBooking
from app.agent.graph import generate_iternerary, continuous_chat_stream, chat_stream

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post(
    "",
    response_model=ChatResponse,
    responses={
        200: {
            "description": "Returns JSON ChatResponse for initial trips or text/event-stream for streaming chat.",
            "content": {"application/json": {}, "text/event-stream": {}},
        }
    },
)
async def handle_chat(
    payload: ChatRequest, session: AsyncSession = Depends(get_session)
) -> ChatResponse | StreamingResponse:
    initial_state: AgentState = {
        "message": [payload.message],
        "origin": payload.origin,
        "destination": payload.destination,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "budget": payload.budget,
        "guest_count": payload.guest_count,
        "session_id": payload.session_id if payload.session_id else str(uuid.uuid4()),
        "weather_info": "",
        "flight_options": "",
        "hotel_options": "",
        "currency": payload.currency or "INR",
    }
    existing_session = await session.get(ChatSession, initial_state["session_id"])
    if not existing_session:
        record = ChatSession(
            origin=initial_state["origin"],
            destination=initial_state["destination"],
            start_date=initial_state["start_date"],
            end_date=initial_state["end_date"],
            budget=initial_state["budget"],
            guest_count=initial_state["guest_count"],
            id=initial_state["session_id"],
        )
        session.add(record)
        await session.commit()
    statement = (
        select(ChatMessages)
        .where(ChatMessages.session_id == initial_state["session_id"])
        .order_by(col(ChatMessages.timestamp))
    )
    result = await session.exec(statement)
    messages = result.all()
    if len(messages) > 0:
        history = [
            {"sender": message.sender, "content": message.content}
            for message in messages
        ]
        formatted_hist = await continuous_chat_stream(history=history)

        async def stream_generator():
            full_reply: str = ""
            async for chunk in chat_stream(formatted_hist, payload.message):
                if chunk:
                    full_reply += chunk
                    yield chunk
            ai_reply = ChatMessages(
                sender="assistant",
                content=full_reply,
                session_id=initial_state["session_id"],
            )
            session.add(ai_reply)
            await session.commit()

        user_message = ChatMessages(
            sender="user",
            content=payload.message,
            session_id=initial_state["session_id"],
        )
        session.add(user_message)
        await session.commit()
        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    else:
        user_message = ChatMessages(
            sender="user",
            content=payload.message,
            session_id=initial_state["session_id"],
        )
        session.add(user_message)
        await session.commit()
        try:
            final_state = await travel_agent.ainvoke(initial_state)
            ai_reply = final_state["message"][-1]
        except Exception as e:
            ai_reply = f"## Day 1\n* **[{payload.destination} City Immersion]**: Explore top sights in {payload.destination}."
        agent_message = ChatMessages(
            sender="assistant", session_id=initial_state["session_id"], content=ai_reply
        )
        session.add(agent_message)
        await session.commit()
        return ChatResponse(
            reply=ai_reply,
            session_id=initial_state["session_id"],
            status="success",
        )


@router.get("/sessions")
async def get_all_sessions(session: AsyncSession = Depends(get_session)):
    statement = select(ChatSession).order_by(col(ChatSession.created_at).desc())
    result = await session.exec(statement=statement)
    response_list = []
    for res in result:
        messages = (
            select(ChatMessages)
            .where(
                ChatMessages.session_id == res.id, ChatMessages.sender == "assistant"
            )
            .order_by(col(ChatMessages.timestamp))
        )
        msg_result = await session.exec(messages)
        first_ai_msg = msg_result.first()
        response_list.append(
            {
                "id": res.id,
                "origin": res.origin,
                "destination": res.destination,
                "start_date": res.start_date,
                "end_date": res.end_date,
                "budget": res.budget,
                "guest_count": res.guest_count,
                "description": (
                    first_ai_msg.content
                    if first_ai_msg
                    else f"{res.destination} Itinerary"
                ),
                "created_at": res.created_at,
            }
        )
    return response_list


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, session: AsyncSession = Depends(get_session)):
    db_session = await session.get(ChatSession, session_id)
    if not db_session:
        return {"status": "success", "message": "Session not found"}
    messages = await session.exec(
        select(ChatMessages).where(ChatMessages.session_id == session_id)
    )
    for message in messages.all():
        await session.delete(message)
    flight = await session.exec(
        select(FlightBooking).where(FlightBooking.session_id == session_id)
    )
    for record in flight.all():
        await session.delete(record)
    hotel = await session.exec(
        select(HotelBooking).where(HotelBooking.session_id == session_id)
    )
    for record in hotel.all():
        await session.delete(record)
    await session.delete(db_session)
    await session.commit()
    return {"status": "success"}

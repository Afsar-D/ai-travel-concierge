import streamlit as st
from streamlit import user
from streamlit.source_util import Icon
# sidebar 
with st.sidebar:
    st.text_input("give me prompt", placeholder='3-days paris trip')
    st.header("Days")
    st.number_input('number of days',3,15)
    st.date_input(label='Date')
    st.header("Budget")
    st.select_slider('Budget', options=['Low', 'Medium', 'High'])

# Main Content
st.title("Travel Conicerge")
# st.session_state
with st.chat_message('ai'):
    st.text('hello user')
if 'messages' not in st.session_state:
    st.session_state.messages = []
if user_input:= st.chat_input(placeholder='Type something here'):
    st.session_state.messages.append({
        'role' : 'user',
        'content' : user_input
    })
    st.session_state.messages.append({
        'role': 'ai',
        'content' : f'{user_input}, ill look into it'
    })
for key in st.session_state.messages:
    with st.chat_message(key['role']):
        st.write(key['content'])
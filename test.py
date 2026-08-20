import streamlit as st
from streamlit import user
from streamlit.source_util import Icon
with st.sidebar:
    st.text_input("give me prompt", placeholder='3-days paris trip')
    st.header("Days")
    st.number_input('number of days',3,15)
    st.date_input(label='Date')
    st.header("Budget")
    st.select_slider('Budget', options=['Low', 'Medium', 'High'])
    
st.title("Travel Conicerge")
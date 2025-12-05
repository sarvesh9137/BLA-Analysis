import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Page Config
st.set_page_config(page_title="Utthan Baseline Assessment Analysis Dashboard-Mumbai", layout="wide")

# Custom Styling
def apply_custom_styling():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
        html, body, [class*="css"]  {
            font-family: 'Poppins', sans-serif;
        }
        
        /* Title Styling */
        h1 {
            text-align: center;
            color: #2E86C1; /* Professional Blue */
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f2f6;
            margin-bottom: 2rem;
        }
        
        /* Header Styling */
        h2, h3 {
            color: #283747;
            margin-top: 1rem;
        }
        
        /* Tab Styling */
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }

        .stTabs [data-baseweb="tab"] {
            height: 50px;
            white-space: pre-wrap;
            background-color: #F4F6F6;
            border-radius: 5px 5px 0px 0px;
            gap: 1px;
            padding-top: 10px;
            padding-bottom: 10px;
            color: #566573;
        }

        .stTabs [aria-selected="true"] {
            background-color: #FFFFFF;
            border-top: 3px solid #2E86C1;
            color: #2E86C1;
            font-weight: 600;
            box-shadow: 0px -2px 5px rgba(0,0,0,0.05);
        }
        
        /* DataFrame Styling */
        .stDataFrame {
            border: 1px solid #E5E8E8;
            border-radius: 5px;
            padding: 5px;
        }
        
        /* Expander Styling */
        .streamlit-expanderHeader {
            background-color: #EBF5FB;
            color: #2E86C1;
            font-weight: 500;
            border-radius: 5px;
        }
        
        /* Button Styling */
        .stButton button {
            background-color: #2E86C1;
            color: white;
            border-radius: 5px;
            border: none;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
        }
        
        .stButton button:hover {
            background-color: #1B4F72;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        </style>
    """, unsafe_allow_html=True)

apply_custom_styling()

# Title
st.title("Utthan Baseline Assessment Analysis Dashboard-Mumbai")

# Data Loading
@st.cache_data
def load_data():
    file_path = "BLA Master file.xlsx"
    try:
        df = pd.read_excel(file_path)
        # Basic cleanup
        df.columns = [c.strip() for c in df.columns]
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str).str.strip()
        # Normalize Attendance column
        if 'Attendance' in df.columns:
            df['Attendance'] = df['Attendance'].replace({
                'Longabsent': 'Long Absent',
                'Long absent': 'Long Absent',
                'long absent': 'Long Absent',
                'longabsent': 'Long Absent',
                'Na': 'NA',
                'nan': 'NA',
                'NAN': 'NA',
                'NaN': 'NA'
            })
        
        # Normalize Medium column
        if 'Medium' in df.columns:
            df['Medium'] = df['Medium'].astype(str).str.strip().str.title()
            
        # Normalize School Name column
        if 'School Name' in df.columns:
            df['School Name'] = df['School Name'].astype(str).str.strip().str.title()
            
        return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None

def preprocess_data(df):
    # Map Learning Levels to Categories
    # Green: L4, L5
    # Yellow: L2, L3
    # Normalize Learning Levels (L0-L5)
    for col in ['Reading', 'Writing', 'Numeracy']:
        if col in df.columns:
            # Ensure uppercase and remove spaces (e.g., 'l 0' -> 'L0')
            df[col] = df[col].astype(str).str.upper().str.replace(' ', '')
            
            # Handle potential 'LEVEL' prefix if it exists (optional robustness)
            df[col] = df[col].str.replace('LEVEL', 'L')

    # Map Learning Levels to Categories
    # Green: L4, L5
    # Yellow: L2, L3
    # Red: L0, L1
    
    level_map = {
        'L0': 'Needs improvement', 'L1': 'Needs improvement',
        'L2': 'Developing stage', 'L3': 'Developing stage',
        'L4': 'Progressive', 'L5': 'Progressive'
    }
    
    for col in ['Reading', 'Writing', 'Numeracy']:
        if col in df.columns:
            df[f'{col}_Category'] = df[col].map(level_map)
            
    return df

# Load and Preprocess
df = load_data()

if df is not None:
    df = preprocess_data(df)

    # Tabs for Sections
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "Ward Wise Attendance", 
        "Medium Wise Distribution", 
        "Class Wise Attendance", 
        "Learning Level Distribution", 
        "Comparative Views"
    ])

    with tab1:
        st.header("Ward Wise Attendance Distribution")
        
        # 1. Ward Wise Attendance Table
        ward_att = df.groupby(['Ward', 'Attendance']).size().unstack(fill_value=0)
        
        # Ensure columns exist
        for col in ['Present', 'Absent', 'Long Absent']:
            if col not in ward_att.columns:
                ward_att[col] = 0
                
        # Calculate Total
        ward_att['Total Students'] = ward_att.sum(axis=1)
        
        # Calculate Percentages
        for col in ['Present', 'Absent', 'Long Absent']:
            ward_att[f'{col}%'] = (ward_att[col] / ward_att['Total Students'] * 100).map('{:.2f}%'.format)
            
        # Select and Reorder Columns
        display_cols = ['Total Students', 'Present', 'Present%', 'Absent', 'Absent%', 'Long Absent', 'Long Absent%']
        ward_att_display = ward_att[display_cols].reset_index()
        ward_att_display.index = ward_att_display.index + 1
        
        st.dataframe(ward_att_display, use_container_width=True)
        
        # 1. Ward Wise Attendance Bar Graph
        # Filter for Present students or just count all? User said "Ward Wise Attendance Distribution table with bar graph"
        # Usually attendance distribution means status breakdown. But "Ward Wise Attendance Distribution" might mean how many present in each ward?
        # Let's show the count of "Present" students per ward for the bar graph as a proxy for "Attendance", 
        # or better, a stacked bar chart of status per ward.
        # User said: "Ward Wise Attendance Distribution table with bar graph."
        # Let's do a stacked bar graph of Status by Ward.
        
        attendance_by_ward = df.groupby(['Ward', 'Attendance']).size().reset_index(name='Count')
        fig_ward_bar = px.bar(attendance_by_ward, x='Ward', y='Count', color='Attendance', 
                              title="Ward Wise Attendance Distribution", barmode='group')
        st.plotly_chart(fig_ward_bar, use_container_width=True)
        
        # 2. Overall Attendance Donut Chart
        attendance_counts = df['Attendance'].value_counts().reset_index()
        attendance_counts.columns = ['Status', 'Count']
        
        fig_att_donut = px.pie(attendance_counts, values='Count', names='Status', hole=0.5, 
                               title="Overall Attendance Distribution")
        fig_att_donut.update_traces(textposition='inside', textinfo='percent+label')
        st.plotly_chart(fig_att_donut, use_container_width=True)

    with tab2:
        st.header("Medium Wise Student Distribution")
        
        # 1. Medium Wise Table with Percentages
        medium_counts = df['Medium'].value_counts().reset_index()
        medium_counts.columns = ['Medium', 'Count']
        medium_counts['Percentage'] = (medium_counts['Count'] / medium_counts['Count'].sum()) * 100
        medium_counts['Percentage'] = medium_counts['Percentage'].map('{:.2f}%'.format)
        medium_counts.index = medium_counts.index + 1
        
        st.dataframe(medium_counts, use_container_width=True)
        
        # 2. Medium Wise Bar Graph
        fig_medium_bar = px.bar(medium_counts, x='Medium', y='Count', text='Count',
                                title="Medium Wise Student Distribution")
        fig_medium_bar.update_traces(textposition='outside')
        st.plotly_chart(fig_medium_bar, use_container_width=True)

    with tab3:
        st.header("Class Wise Attendance Distribution")
        
        # 1. Class Wise Attendance Table
        class_att_table = pd.crosstab(df['Class'], df['Attendance'], margins=True)
        # No index adjustment needed for crosstab as index is Class labels
        st.dataframe(class_att_table, use_container_width=True)
        
        # 2. Donut Charts for each Class (I to IV)
        classes = ['I', 'II', 'III', 'IV']
        cols = st.columns(2)
        
        for i, cls in enumerate(classes):
            cls_df = df[df['Class'] == cls]
            if not cls_df.empty:
                att_counts = cls_df['Attendance'].value_counts().reset_index()
                att_counts.columns = ['Status', 'Count']
                
                fig = px.pie(att_counts, values='Count', names='Status', hole=0.5, 
                             title=f"Class {cls} Attendance")
                fig.update_traces(textposition='inside', textinfo='percent+label')
                
                with cols[i % 2]:
                    st.plotly_chart(fig, use_container_width=True)

    with tab4:
        st.header("Learning Level Distribution")
        
        # Filters
        with st.expander("Filters", expanded=True):
            f_col1, f_col2, f_col3 = st.columns(3)
            with f_col1:
                selected_ward = st.multiselect("Select Ward", options=sorted(df['Ward'].unique()), key='ll_ward')
            with f_col2:
                selected_class = st.multiselect("Select Class", options=sorted(df['Class'].unique()), key='ll_class')
            with f_col3:
                selected_school = st.multiselect("Select School", options=sorted(df['School Name'].unique()), key='ll_school')
            
            def clear_filters():
                st.session_state.ll_ward = []
                st.session_state.ll_class = []
                st.session_state.ll_school = []
            
            st.button("Clear Filters", on_click=clear_filters)
        
        # Apply Filters
        filtered_df = df.copy()
        if selected_ward:
            filtered_df = filtered_df[filtered_df['Ward'].isin(selected_ward)]
        if selected_class:
            filtered_df = filtered_df[filtered_df['Class'].isin(selected_class)]
        if selected_school:
            filtered_df = filtered_df[filtered_df['School Name'].isin(selected_school)]
        
        subjects = ['Reading', 'Writing', 'Numeracy']
        cols = st.columns(3)
        
        valid_levels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']
        
        for i, subject in enumerate(subjects):
            if subject in filtered_df.columns:
                # Filter for valid levels only (excludes A, NA, Long Absent, etc.)
                subject_df = filtered_df[filtered_df[subject].isin(valid_levels)]
                
                # Table
                level_counts = subject_df[subject].value_counts().reset_index()
                level_counts.columns = ['Level', 'Count']
                
                if not level_counts.empty:
                    # Sort by Level (L0-L5)
                    level_counts['Level'] = pd.Categorical(level_counts['Level'], categories=valid_levels, ordered=True)
                    level_counts = level_counts.sort_values('Level').reset_index(drop=True)
                    
                    level_counts['Percentage'] = (level_counts['Count'] / level_counts['Count'].sum()) * 100
                    level_counts['Percentage'] = level_counts['Percentage'].map('{:.2f}%'.format)
                    level_counts.index = level_counts.index + 1
                
                with cols[i]:
                    st.subheader(f"{subject} Levels")
                    st.dataframe(level_counts, use_container_width=True)
                    
                    # Donut Chart
                    if not level_counts.empty:
                        fig = px.pie(level_counts, values='Count', names='Level', hole=0.5, 
                                     title=f"{subject} Distribution", category_orders={'Level': valid_levels})
                        fig.update_traces(textposition='inside', textinfo='percent+label', sort=False, direction='clockwise')
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("No data available for valid levels.")

    with tab5:
        st.header("Comparative Views")
        
        # Helper to convert levels to numeric for averaging
        level_numeric = {'L0': 0, 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5}
        for col in ['Reading', 'Writing', 'Numeracy']:
            if col in df.columns:
                df[f'{col}_Score'] = df[col].map(level_numeric)

        # 1. Ward Analysis (Highest/Lowest Learning Levels)
        st.subheader("1. Ward Wise Learning Levels (Average Score)")
        ward_scores = df.groupby('Ward')[['Reading_Score', 'Writing_Score', 'Numeracy_Score']].mean().reset_index()
        ward_scores['Total_Score'] = ward_scores['Reading_Score'] + ward_scores['Writing_Score'] + ward_scores['Numeracy_Score']
        ward_scores = ward_scores.sort_values('Total_Score', ascending=False)
        
        fig_ward_score = px.bar(ward_scores, x='Ward', y=['Reading_Score', 'Writing_Score', 'Numeracy_Score'],
                                title="Average Learning Score by Ward", barmode='group')
        st.plotly_chart(fig_ward_score, use_container_width=True)
        
        st.write("Highest Performing Ward:", ward_scores.iloc[0]['Ward'])
        st.write("Lowest Performing Ward:", ward_scores.iloc[-1]['Ward'])

        # 2. Medium Trends
        st.subheader("2. Medium Wise Trends")
        medium_scores = df.groupby('Medium')[['Reading_Score', 'Writing_Score', 'Numeracy_Score']].mean().reset_index()
        fig_medium_score = px.line(medium_scores, x='Medium', y=['Reading_Score', 'Writing_Score', 'Numeracy_Score'],
                                   title="Average Learning Score Trends by Medium", markers=True)
        st.plotly_chart(fig_medium_score, use_container_width=True)

        # 3. Category Overview
        st.subheader("3. Category Overview (Green/Yellow/Red)")
        st.markdown("""
        *   **<span style='color:green'>Green</span>**: L4 to L5 (Progressive)
        *   **<span style='color:#b58900'>Yellow</span>**: L2 to L3 (Developing stage)
        *   **<span style='color:red'>Red</span>**: L0 to L1 (Needs improvement)
        """, unsafe_allow_html=True)
        cat_cols = st.columns(3)
        subjects = ['Reading', 'Writing', 'Numeracy']
        color_map = {
            'Progressive': 'green', 
            'Developing stage': 'yellow', 
            'Needs improvement': 'red'
        }

        for i, subject in enumerate(subjects):
            with cat_cols[i]:
                if f'{subject}_Category' in df.columns:
                    cat_counts = df[f'{subject}_Category'].value_counts().reset_index()
                    cat_counts.columns = ['Category', 'Count']
                    
                    if not cat_counts.empty:
                        fig_cat = px.pie(cat_counts, values='Count', names='Category', color='Category',
                                         color_discrete_map=color_map, title=f"{subject} Overview")
                        fig_cat.update_traces(textposition='inside', textinfo='percent+label')
                        st.plotly_chart(fig_cat, use_container_width=True)
                    else:
                        st.info(f"No data for {subject}")
else:
    st.warning("Please ensure the data file exists at 'BLA Master file.xlsx'")

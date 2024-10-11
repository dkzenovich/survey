// Application state
export const state = {
    collectedData: [],
    currentPageNum: 1,
    filteredData: []
};

export const updateCollectedData = (surveyData) => {
    const { questions, answers } = surveyData;
    const newData = questions.flatMap((questionSet, index) =>
        questionSet.questions.map((question, qIndex) => ({
            department: questionSet.department,
            question: question,
            answer: answers[index * questionSet.questions.length + qIndex] || '',
            status: 'completed'
        }))
    );
    state.collectedData = [...state.collectedData, ...newData];
    state.filteredData = state.collectedData;
};

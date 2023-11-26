export type notesState = {
    hasNextPage: boolean,
    page: number,
    search: number,
    totalDocs: number,
}

export type notesActions = { 
    type: "NEXT_PAGE" | "PAGE" | "TOTAL_DOCS" | "SEARCH" | "TOTAL_DOCS_AND_NEXT_PAGE",
    payload: any,
}

export const notesReducer = (state: notesState, action: notesActions) => {
    switch (action.type) { 
        case "NEXT_PAGE": {
            return {
               ...state,
                hasNextPage: action.payload,
            };
        }
        case "PAGE" : {
            return {
              ...state,
              page: Number(action.payload),
            };
        }
        case "TOTAL_DOCS" : {
            return {
                ...state,
                totalDocs: action.payload,
            };
        }
        case "TOTAL_DOCS_AND_NEXT_PAGE" : {
            return {
                ...state,
                totalDocs: action.payload.totalDocs,
                hasNextPage: action.payload.hasNextPage,
            };
        }
        case "SEARCH" : {
            return {
                ...state,
                search: action.payload,
            };
        }
        default: {
            throw new Error("Invalid action type")
        }
    }
}

export const note_default_value = {
    hasNextPage: false,
    page: 1,
    search: "",
    totalDocs: 0
}
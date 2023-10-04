export type pinnedNotesState = {
    hasNextPage: boolean,
    page: number,
    totalDocs: number
}

export type pinnedNotesActions = { 
    type: "NEXT_PAGE" | "PAGE" | "TOTAL_DOCS" | "TOTAL_DOCS_AND_NEXT_PAGE",
    payload: any,
}

export const pinnedNotesReducer = (state: pinnedNotesState, action: pinnedNotesActions) => {
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
                page: action.payload,
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
        default: {
            throw new Error("Invalid action type")
        }
    }
};

export const pin_notes_default_value = {
    hasNextPage: false,
    page: 1,
    totalDocs: 0
};
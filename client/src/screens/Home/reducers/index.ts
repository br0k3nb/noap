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

export type labelsState = {
    hasNextPage: boolean,
    page: number,
    search: number
}

export type labelsActions = { 
    type: "NEXT_PAGE" | "PAGE" | "SEARCH" | "PAGE_AND_SEARCH",
    payload: any,
}

export const labelsReducer = (state: labelsState, action: labelsActions) => {
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
        case "SEARCH" : {
            return {
              ...state,
                search: action.payload,
            };
        }
        case "PAGE_AND_SEARCH" : {
            return {
             ...state,
                page: action.payload.page,
                search: action.payload.search,
            };
        }
        default: {
            throw new Error("Invalid action type")
        }
    }
}

export const label_default_value = {
    hasNextPage: false,
    page: 1,
    search: ""
}

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
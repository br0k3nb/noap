declare type NoteData = {
  _id: string;
  userId: string;
  name: string;
  body: string;
  image?: string;
  state: {
    _id: string;
    state: string;
  };
  labels: [{
    _id: string;
    name: string;
    type: string;
    color: string;
    fontColor: string;
  }] | [];
  settings: {
    contributors?: string[];
    showBottomBar: boolean;
    readMode: boolean;
    expanded: boolean;
    shared: boolean;
    pinned: boolean;
    permissions?: string[];
    noteBackgroundColor?: string;
  };
  updatedAt?: string;
  createdAt: string;
};

declare type NoteMetadata = {
  readonly noteMetadata: {
    _id: string;
    userId: string;
    name?: string;
    body: string;
    image?: string;
    label: {
      _id: string;
      name: string;
      type: string;
      color: string;
      fontColor: string;
    };
    labelArraySize: number;
    settings: {
      shared: boolean;
      pinned: boolean;
      permissions?: string[];
      noteBackgroundColor?: string;
    };
    updatedAt?: string;
    createdAt: string;
  }[];
};

declare type Labels = {
    readonly labels: {
      _id: string;
      userId: string;
      name: string;
      color: string;
      fontColor?: string;
      type: string;
      updatedAt?: string;
      createdAt: string;
    }[];
};
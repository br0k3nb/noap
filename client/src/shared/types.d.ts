declare type Notes = {
    readonly note: {
      _id: string;
      userId: string;
      title?: string;
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
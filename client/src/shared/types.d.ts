declare type Notes = {
    readonly note: {
      _id: string;
      userId: string;
      name?: string;
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
        shared: boolean;
        pinned: boolean;
        permissions?: string[];
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
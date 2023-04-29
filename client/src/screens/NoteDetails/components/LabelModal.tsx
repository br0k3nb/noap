import {
    SetStateAction,
    Dispatch,
    useState,
    useContext
} from 'react';

import { FieldArrayWithId } from 'react-hook-form';

import api from '../../../services/api';

import { RefetchContext } from '../../Home';
import { toastAlert } from '../../../components/Alert/Alert';

type Props = {
    checked: boolean;
    isFetching: boolean;
    selectedNote: string | false;
    setChecked: Dispatch<SetStateAction<boolean>>;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

type Labels = {
    labels: {
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

export default function LabelModal({ checked, setChecked, isFetching, labels, selectedNote }: Props) {
    const [ loader, setLoader ] = useState(false);
    const [ selectedLabel, setSelectedLabel ] = useState<number | null>(null);
    
    const refetch = useContext(RefetchContext);

    const token = JSON.parse(
        window.localStorage.getItem("user_token") || "{}"
    );

    const addLabel = async () => {
        setLoader(true);
        try {
            if(selectedLabel !== null && selectedNote) {
                const findLabel = labels[selectedLabel]
    
                const attachLabel = await api.post(`https://noap-typescript-api.vercel.app/note/add/label/${token.token}`, { 
                    labelId: findLabel._id,
                    noteId: selectedNote 
                });
                toastAlert({icon: "success", title: `${attachLabel.data.message}`, timer: 2000});
                setLoader(false);
                refetch?.fetchNotes();
            }
            else return toastAlert({icon: "error", title: `Please, select a label!`, timer: 2000});
        } catch (err: any) {
            console.log(err);
            setLoader(false);
            toastAlert({
                icon: "error",
                title: `${err.response.data.message}`,
                timer: 2000
            });
        }
    }

    return (
        <div>
            <input 
                type="checkbox"
                id="my-modal-3"
                className="modal-toggle" 
                checked={checked}
                readOnly
            />
            <div className="modal">
                <div className="modal-box relative !bg-gray-800 !px-0 w-[24rem] max-h-[27.6rem] !overflow-hidden">
                    <div className="flex flex-row justify-between border border-transparent border-b-gray-600 px-6 pb-5">
                        <h3 className="text-2xl tracking-tight font-light text-gray-200">Select a label</h3>
                        <label 
                            htmlFor="my-modal-3" 
                            className="btn btn-sm btn-circle bg-gray-700"
                            onClick={() => setChecked(false)}
                        >
                            ✕
                        </label>
                    </div>
                    <div>
                        <div className="mb-8 mt-5 text-gray-300 px-6 ">
                            <p className='text-base uppercase tracking-widest'>Your labels</p>
                            {isFetching ? (
                                <div
                                    className='flex flex-row justify-center animate-pulse my-12'
                                >
                                    <svg
                                    aria-hidden="true"
                                    role="status"
                                    className="inline w-5 h-5 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="#E5E7EB"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"
                                    />
                                    </svg>
                                    <span className="pb-[2px] xxs:pt-[2.4px] uppercase tracking-widest">
                                    Loading...
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2 mt-4 text-sm px-1 max-h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                                    {labels.map((chip: any, idx: number) => {
                                        return (                                        
                                            <div className="flex space-x-2 justify-between pr-2" key={idx}>
                                                {chip.type === 'outlined' ? (
                                                    <div 
                                                    className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest"
                                                    style={{
                                                        borderColor: chip.color,
                                                        color: chip.color
                                                    }}
                                                >
                                                    {chip.name}
                                                </div>
                                                ) : (
                                                    <div 
                                                        className="badge badge-accent !py-3 uppercase text-xs tracking-widest"
                                                        style={{
                                                            backgroundColor: chip.color,
                                                            borderColor: chip.color,
                                                            color: chip.fontColor
                                                        }}
                                                    >
                                                        {chip.name}
                                                    </div>
                                                )}
                                                    <input 
                                                        type="radio"
                                                        name="radio-1" 
                                                        className="radio !bg-gray-600 border !border-gray-400"
                                                        onClick={() => setSelectedLabel(idx)}
                                                    />
                                            </div>
                                        )
                                    })}
                                </div>    
                            )}
                        </div>
                        <div className="border border-transparent border-t-gray-400 flex items-center justify-center">
                            <button
                                type='button'
                                className='text-[14px] hover:text-[15px] uppercase tracking-widest text-gray-300 mt-5 transition-all duration-500'
                                onClick={() => addLabel()}
                            >
                                Attach label
                            </button>
                        </div>
                    </div>
                </div>
            </div>      
        </div>
    )
}
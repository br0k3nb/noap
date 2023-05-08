import {
    SetStateAction,
    Dispatch,
    useContext
} from 'react';

import { FieldArrayWithId, FieldValues, useForm } from 'react-hook-form';

import { AiFillTags } from 'react-icons/ai';

import api from '../../../services/api';

import { RefetchCtx } from '../../../context/RefetchCtx';
import { toastAlert } from '../../../components/Alert/Alert';
import Modal from '../../../components/Modal';

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

export default function SelectLabelModal({ checked, setChecked, isFetching, labels, selectedNote }: Props) {

    const { register, handleSubmit} = useForm();
    
    const refetch = useContext(RefetchCtx);

    const token = JSON.parse(
        window.localStorage.getItem("user_token") || "{}"
    );

    const addLabel = async (data: FieldValues) => {
        try {
            const labels = [];

            for (const [key, value] of Object.entries(data)) {
                if(value) labels.push(key);
            }

            if(labels.length === 0) return toastAlert({icon: "error", title: `Please, select a label!`, timer: 2000});

            const attachLabel = await api.post(`https://noap-typescript-api.vercel.app/note/add/label/${token.token}`, { 
                labels,
                noteId: selectedNote 
            });

            toastAlert({icon: "success", title: `${attachLabel.data.message}`, timer: 2000});
            refetch?.fetchNotes();
        } catch (err: any) {
            console.log(err);
            toastAlert({
                icon: "error",
                title: `${err.response.data.message}`,
                timer: 2000
            });
        }
    }

    return (
        <div>
            <Modal
                open={checked}
                setOpen={setChecked}
                title='Select a label'
                titleWrapperClasName='px-6'
                modalWrapperClassName='!px-0 xxs:!w-[18rem] w-[24rem] max-h-[27.6rem] overflow-hidden'
            >
                <div>
                    <div className="mb-8 mt-5 text-gray-300">
                        <p className='text-base uppercase tracking-widest px-6'>Your labels</p>
                        {isFetching ? (
                            <div
                                className='flex flex-row justify-center animate-pulse my-12 px-6'
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
                        ) : labels.length > 0 ? (
                            <div className="flex flex-col space-y-2 mt-4 text-sm px-1 max-h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                                <form onSubmit={handleSubmit(addLabel)}>
                                    <div className="mb-7">
                                        {labels.map((chip: any, idx: number) => {
                                            return (                                        
                                                <div className="flex space-x-2 justify-between px-6" key={idx}>
                                                    <div className="my-auto">
                                                        {chip.type === 'outlined' ? (
                                                            <div 
                                                                className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate"
                                                                style={{
                                                                    borderColor: chip.color,
                                                                    color: chip.color
                                                                }}
                                                            >
                                                                {chip.name.length > 25 ? chip.name.slice(0,25) + '...' : chip.name}
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate"
                                                                style={{
                                                                    backgroundColor: chip.color,
                                                                    borderColor: chip.color,
                                                                    color: chip.fontColor
                                                                }}
                                                            >
                                                                {chip.name.length > 25 ? chip.name.slice(0,25) + '...' : chip.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="checkbox !h-5 !w-5"
                                                                {...register(`${chip._id}`)}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="w-full border border-transparent border-t-gray-400 flex items-center justify-center fixed left-0 bottom-0 pb-5 bg-gray-800">
                                        <button
                                            type='submit'
                                            className='text-[14px] hover:text-[15px] uppercase tracking-widest text-gray-300 mt-5 transition-all duration-500'
                                        >
                                            Attach label
                                        </button>
                                    </div>
                                </form>
                            </div>    
                        ) : (
                            <div className="flex flex-col space-y-4 items-center justify-center mt-5 text-gray-500">
                                <AiFillTags size={60} className='!mt-5'/>
                                <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>Your labels will appear here!</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
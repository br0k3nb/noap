import { SetStateAction, Dispatch, useContext } from 'react';
import { FieldArrayWithId, FieldValues, useForm } from 'react-hook-form';
import { AiFillTags } from 'react-icons/ai';

import api from '../../../services/api';

import LabelModal from '../../Home/components/nav/components/LabelModal';
import { toastAlert } from '../../../components/Alert/Alert';
import { RefetchCtx } from '../../../context/RefetchCtx';
import SvgLoader from '../../../components/SvgLoader';
import Modal from '../../../components/Modal';

type Props = {
    checked: boolean;
    isFetching: boolean;
    selectedNote: string | false;
    setChecked: Dispatch<SetStateAction<boolean>>;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

export default function SelectLabelModal({ labels, checked, setChecked, isFetching, selectedNote }: Props) {
    const { register, handleSubmit} = useForm();
    const refetch = useContext(RefetchCtx);

    const token = JSON.parse(window.localStorage.getItem("user_token") || "{}");

    const addLabel = async (data: FieldValues) => {
        try {
            const labels = [];

            for (const [key, value] of Object.entries(data)) value && labels.push(key);
            if(labels.length === 0) return toastAlert({icon: "error", title: `Please, select a label!`, timer: 2000});

            const attachLabel = await api.post(`/note/add/label/${token.token}`, { labels, noteId: selectedNote });
            toastAlert({icon: "success", title: `${attachLabel.data.message}`, timer: 2000});
            refetch?.fetchNotes();
        } catch (err: any) {
            toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
        }
    }

    const modalProps = {
        open: checked,
        setOpen: setChecked,
        title: "Select a label",
        options: {
            titleWrapperClassName: 'px-6',
            modalWrapperClassName: '!px-0 xxs:!w-[18rem] w-[24rem] max-h-[27.6rem] overflow-hidden'
        }
    }

    return (
        <Modal {...modalProps}>
            <div className="mb-8 mt-5 text-gray-300">
                <p className='text-base uppercase tracking-widest px-6'>Your labels</p>
                {isFetching ? <SvgLoader options={{ showLoadingText: true, wrapperClassName: "my-10" }}/> : labels.length > 0 ? (
                    <div className="flex flex-col space-y-2 mt-4 text-sm px-1 max-h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                        <form onSubmit={handleSubmit(addLabel)}>
                            {labels.map((chip: any, idx: number) => {
                                const { color, fontColor, name, _id, type } = chip;
                                return (                                        
                                    <div className={`flex space-x-2 justify-between px-6 ${idx === labels.length - 1 && "mb-5"}`} key={idx}>
                                        <div className="my-auto">
                                            {type === 'outlined' ? (
                                                <div className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate" style={{ borderColor: color, color }}>
                                                    {name.length > 25 ? name.slice(0,25) + '...' : name}
                                                </div>
                                            ) : (
                                                <div className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate" style={{ backgroundColor:color, borderColor: color, color: fontColor }}>
                                                    {name.length > 25 ? name.slice(0,25) + '...' : name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer">
                                                <input type="checkbox" className="checkbox !h-5 !w-5" {...register(_id)}/>
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="w-full border border-transparent border-t-gray-400 flex items-center justify-center fixed left-0 bottom-0 pb-5 bg-gray-800">
                                <button className='text-[14px] hover:text-[15px] uppercase tracking-widest text-gray-300 mt-5 transition-all duration-500' type='submit'>
                                    Attach label
                                </button>
                            </div>
                        </form>
                    </div>    
                ) : (
                    <div className="flex flex-col space-y-4 items-center justify-center mt-5 text-gray-500">
                        <AiFillTags size={60} className='!mt-5'/>
                        <div className='!mb-6'>
                            <button className="text-gray-200 text-xs font-light tracking-widest uppercase px-3 mr-5 h-10 rounded-full hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-full mx-auto">
                                Create a label
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
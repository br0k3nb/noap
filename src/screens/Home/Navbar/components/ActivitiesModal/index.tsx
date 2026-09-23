import { Dispatch, SetStateAction, useState } from 'react';

import Modal from '../../../../../components/Modal';
import ConfirmationModal from '../../../../../components/ConfirmationModal';
import { toastAlert } from '../../../../../components/Alert';

import useActivities from '../../../../../hooks/useActivities';

import ListActivities from './ListActivities';
import ActivityForm from './ActivityForm';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ActivitiesModal({ open, setOpen }: Props) {
    const [loader, setLoader] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [goBackButtonAction, setGoBackButtonAction] = useState<{ action: (() => void) | null }>({ action: null });
    const [activitiesModalStatus, setActivitiesModalStatus] = useState<"create" | "edit" | "list">("list");

    const { activities, isFetching, toggleActivity, deleteActivity } = useActivities();

    const goToList = () => {
        setActivitiesModalStatus("list");
        setActivityToEdit(null);
        setShowGoBackButton(false);
        setGoBackButtonAction({ action: null });
    };

    const onAddNewActivityClick = () => {
        setActivityToEdit(null);
        setActivitiesModalStatus("create");
        setShowGoBackButton(true);
        setGoBackButtonAction({ action: goToList });
    };

    const resetActivityInfoToEdit = (activity: Activity) => {
        setActivityToEdit(activity);
        setActivitiesModalStatus("edit");
        setShowGoBackButton(true);
        setGoBackButtonAction({ action: goToList });
    };

    const closeModal = () => {
        setOpen(false);
        setTimeout(() => goToList(), 500);
    };

    const openDeleteModal = (activity: Activity) => {
        setSelectedActivity(activity);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedActivity(null);
    };

    const onToggleActivity = async (activity: Activity) => {
        try {
            const { message } = await toggleActivity(activity._id, !activity.enabled);
            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            toastAlert({ icon: 'error', title: err?.message ?? "Error, please try again later!", timer: 3000 });
        }
    };

    const onDeleteActivity = async () => {
        if (!selectedActivity) {
            return toastAlert({ icon: 'error', title: 'Please, select an activity to delete', timer: 3000 });
        }

        setLoader(true);
        try {
            const { message } = await deleteActivity(selectedActivity._id);
            setLoader(false);
            closeDeleteModal();
            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: err?.message ?? "Error, please try again later!", timer: 3000 });
        }
    };

    const modalProps = {
        open,
        setOpen,
        title: 'Activities',
        options: {
            onClose: closeModal,
            showGoBackButton: showGoBackButton,
            goBackButtonAction: goBackButtonAction.action ?? undefined,
            titleWrapperClassName: "px-6 sticky top-0 z-10 bg-[#ffffff] dark:bg-[#0f1011]",
            modalWrapperClassName: `xxs:!w-[18rem] !px-0 !w-[23rem] max-h-[min(33.2rem,90vh)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300`
        }
    };

    return (
        <>
            <Modal {...modalProps}>
                <>
                    {activitiesModalStatus === "list" ? (
                        <ListActivities
                            activities={activities}
                            isFetching={isFetching}
                            onAddActivityClick={onAddNewActivityClick}
                            resetActivityInfoToEdit={resetActivityInfoToEdit}
                            openDeleteModal={openDeleteModal}
                            onToggleActivity={onToggleActivity}
                        />
                    ) : (
                        <ActivityForm
                            key={activityToEdit?._id ?? "new"}
                            mode={activitiesModalStatus === "create" ? "create" : "edit"}
                            activity={activityToEdit}
                            onSaved={goToList}
                            loader={loader}
                            setLoader={setLoader}
                        />
                    )}
                </>
            </Modal>
            <ConfirmationModal
                open={deleteModal}
                setOpen={setDeleteModal}
                actionButtonFn={onDeleteActivity}
                mainText='Are you sure you want to delete this activity?'
                options={{
                    loader,
                    onClose: closeDeleteModal,
                    modalWrapperClassName: "!w-96 xxs:!w-80",
                    mainTextClassName: "xxs:text-xs"
                }}
            />
        </>
    )
}
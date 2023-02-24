import {forwardRef} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {styled} from '@mui/material/styles';

export function DialogBody(props) {
    const {children, open, onClose, ...rest} = props;

    return (
        <Dialog
            {...rest}
         
            keepMounted
            fullWidth
            scroll="paper"
            open={open}
            TransitionComponent={Transition}
            onClose={onClose}
        >
            {children}
        </Dialog>
    );
};

export function TitleDialog(props) {
    const {children, closeBtn, ...rest} = props;

    return (
        <DialogTitle {...rest}>
            {children}
            {closeBtn && (
                <CloseButton onClick={closeBtn}>
                    <CloseIcon style={{marginRight: 3}}/>
                </CloseButton>
            )}
        </DialogTitle>
    );
};

export function ContentDialog({children, ...props}) {
    return (
        <DialogContent {...props} dividers>
            {children}
        </DialogContent>
    );
};

export function ActionsDialog({children, ...props}) {
    return (
        <DialogActions {...props}>
            {children}
        </DialogActions>
    );
};

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const CloseButton = styled(IconButton)(({theme}) => ({
    position: 'absolute',
    right: 16,
    top: 12,
    color: theme.palette.grey[500],
}));
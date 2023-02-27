import { Dispatch, SetStateAction } from 'react';
import { Typography, Box, Grid, Button, Card, CardContent, CardActions, Paper, Chip, IconButton, Stack } from "@mui/material";
import { Delete, Edit, MoreVert } from '@mui/icons-material';

type Activity = {
    _id: string;
    title: string;
    body: string;
    bookmark: boolean;
    bookmarkColor: string;
    themeSwitch?: boolean;
    updatedAt?: string;
    createdAt: string;
}

type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
}

type CardsProps = {
    theme: Theme | null;
    val: Activity;
    handleUpdate: (id: string) => unknown;
    handleDelete: (id: string) => unknown;
    dateFormater: (date: string) => string;
    setDeleteId: Dispatch<SetStateAction<string | number | null>>;
    setEditId: Dispatch<SetStateAction<string | boolean>>;
    index: number;
}

export default function Cards({
        theme,
        handleUpdate,
        handleDelete, 
        setDeleteId,
        setEditId,
        dateFormater,
        val, 
        index,
    }: CardsProps) {

    return (
        <Grid item md={2.8} ml={3} mb={3} mr={0} key={index}>
            <Card component={Paper} elevation={10} id={theme?.theme} className='customCard'>
                <Stack direction='row' justifyContent={val.bookmark ? 'space-between' : 'flex-end'}>
                    {val.bookmark && (
                        <>
                            <Chip
                                component={Paper}
                                elevation={5}
                                style={{
                                    backgroundColor: val.bookmarkColor,
                                    borderRadius: 15,
                                    marginTop: -8,
                                    marginLeft: -10,  
                                    width: '56px',
                                    height: '60px',
                                    display: 'inline-table',
                                }}
                            />
                        </>
                    )}
                    <IconButton style={theme?.theme === 'dark' ? {color: '#eeeeee'}: undefined}>
                        <MoreVert style={{fontSize: 30}}/>
                    </IconButton>
                </Stack>
                <CardContent style={val.bookmark ? {marginTop: -15} : undefined}>
                <Typography 
                    gutterBottom 
                    variant="h5"
                    align="center" 
                    component="div" 
                    mb={2}
                >
                    {val.title}
                </Typography>
                <Typography variant="body1">
                    {val.body}
                </Typography>
                <Box>
                    <Typography style={{fontFamily: 'inherit'}} className="mb-2 mt-4">
                        {!val?.updatedAt ? 'Created at: ' + dateFormater(val.createdAt) : 'Updated at: ' + dateFormater(val.updatedAt)}
                    </Typography>
                </Box>
                </CardContent>
                <CardActions>
                    <Box style={{width: '100%'}} pb={1} pt={1}>
                        <Button
                            id={theme?.theme}
                            className='rounded-pill customButton'
                            style={{  
                                fontFamily: 'inherit',
                                fontSize: 13,
                                borderRadius: 10,
                                marginLeft: 10,
                                width: "45%",
                            }}
                            variant="outlined"
                            onClick={() => {
                                handleUpdate(val._id); 
                                setEditId(val._id);
                            }}
                            endIcon={<Edit/>}
                        >
                            Edit
                        </Button>
                        <Button
                            id={theme?.theme}
                            className='rounded-pill customButton'
                            style={{
                                fontFamily: 'inherit',
                                marginLeft: 10,
                                fontSize: 13,
                                borderRadius: 10,
                                width: "45%",
                            }}
                            variant="outlined"
                            onClick={() => {
                                handleDelete(val._id); 
                                setDeleteId(val._id);
                            }}
                            endIcon={<Delete/>}
                        >
                            Delete
                        </Button>
                    </Box>
                </CardActions>
            </Card>
        </Grid>
    )
}
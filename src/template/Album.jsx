import React, { useContext, useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import LinkedCameraOutlinedIcon from '@mui/icons-material/LinkedCameraOutlined';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db, storage } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { AuthContext } from '../AuthContext';
import { ImageList, ImageListItem, Modal } from '@mui/material';
import { RiImageAddFill } from 'react-icons/ri'
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore"; 
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import uuid from 'react-uuid';
import { SlCamera } from 'react-icons/sl';

const theme = createTheme();
  
export default function Album(card) {
  const [cards , setCards] = useState(undefined);
  const [userName , setUserName] = useState('');
  const {currentUser} = useContext(AuthContext);
  const [navigate, setNavigate] = useState('');

useEffect(() => {
  const getDatas = async ()=>{
    if(card && Object.entries(card)[0][1]?.Posts?.length > 0){
      setCards(Object.entries(card)[0][1]?.Posts);
    } else{
      setCards(undefined);
    }
  
    if(currentUser){
        const docRef = await doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap?.data()?.firstName);
        } else {
          console.log("No such document!");
      }
    }
  }
  
  return () => {
    getDatas();
  }
}, [card, currentUser])


const handleSubmit = ()=>{
  if(currentUser){
    signOut(auth);
    setNavigate('/');
  } else {
    setNavigate('/register');
  }
};

const createPost = ()=>{
  if(currentUser){
    handleOpen();
  } else {
    alert("You should login first");
  }
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: 357,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '10px',
};

const [open, setOpen] = useState(false);
const handleOpen = () => setOpen(true);
const handleClose = () => setOpen(false);

const [fileValue, setFileValue] = useState(null);
const [textValue, setTextValue] = useState([]);

const [err, setErr] = useState(false);
const [loading, setLoading] = useState(false);

const uploadData = async (e)=>{
  setLoading(true);
  e.preventDefault();
  const userID = currentUser.uid;
  const file = fileValue;
  const text = textValue;
  const id = uuid();
  const photoID = uuid();

  try {
    const storageRef = ref(storage, `images/${photoID}.jpg`);

    await uploadBytesResumable(storageRef, file).then(() => {
      getDownloadURL(storageRef).then(async (downloadURL) => {
        try {
          //Update profile
          await updateProfile(currentUser, {
            userID,
            photoURL: downloadURL,
          });

          //update empty user Posts on firestore
          await updateDoc(doc(db, "userPosts", userID), {
            [userID + '.userP']: arrayUnion({
              id:id,
              description: text,
              photoURL: downloadURL,
              userID: userID,
              photoID: photoID
            }),
          });
          await updateDoc(doc(db, "Posts" , "Global Posts") ,{
            Posts: arrayUnion({
              id:id,
              description: text,
              photoURL: downloadURL,
              userID: userID,
              photoID: photoID
            })
          });
          handleClose();
          setFileValue(null);
          setTextValue('');
          setLoading(false);
          window.location.reload(false)
          
        } catch (err) {
          console.log(err);
          setErr(true);
          setLoading(false);
        }
      });
    });
  } catch (err) {
    console.log(err);
    setErr(true);
    setLoading(false);
  }
};

// i am getting my uploaded posts
const [data, setData] = useState([])
const [datas , setDatas] = useState();

  
useEffect(()=>{
  const getDatass =  async () => {
    const docRef = collection(
      db,
      "userPosts",
    );
    let cars = [];
    const querySnapshot  = await getDocs(docRef);
    querySnapshot?.forEach((doc) => {
      cars?.push(doc?.data())
      setData(cars);
      data?.forEach((post)=>{
        if(currentUser && Object.keys(post)[0] === currentUser?.uid){
          setDatas(post)
        }
      });
    });
    
  }
  getDatass()
},[currentUser?.uid, data])


// console.log(datas)


const [my, setMy] = useState(true);
const myPosts = ()=>{
  if(currentUser){
    if(my){
        (Object.entries(datas)[0][1]?.userP?.length > 0)?setCards(Object.entries(datas)[0][1]?.userP): setCards(undefined)
        setMy(false);
        }else{
          (Object.entries(card)[0][1]?.Posts?.length > 0)?setCards(Object.entries(card)[0][1]?.Posts):setCards(undefined)
        setMy(true)
        }
      } else{
        alert("You should login first");
      }
    }
      
    
    const deletePost = async (e)=>{
      const postRef = doc(db, "Posts", 'Global Posts');
      const myPostRef = doc(db, "userPosts", currentUser.uid);
      const storage = getStorage();
      const desertRef = ref(storage, `images/${e.photoID}.jpg`);
      
     await deleteObject(desertRef).then(() => {
        // File deleted successfully
      }).catch((error) => {
        // Uh-oh, an error occurred!
        console.log(error);
      });
      
  await updateDoc(postRef,{
    Posts:arrayRemove({
          id:e.id,
          description: e.description,
          photoURL: e.photoURL,
          userID: e.userID,
          photoID: e.photoID
      })
    })

    cards?.forEach(card =>{
        if(card === e){
          updateDoc(myPostRef,{
          [currentUser.uid + '.userP']: arrayRemove({
          id:e.id,
          description: e.description,
          photoURL: e.photoURL,
          userID: e.userID,
          photoID: e.photoID
          }),
        })
      }
    });

    window.location.reload(false);
}

const reload = ()=>{
  window.location.reload(false);
}

function srcset(image, size, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <LinkedCameraOutlinedIcon onClick={reload} sx={{ mr: 1.5 , fontSize:"40px", cursor:'pointer'}} />
          <Typography onClick={reload} style={{cursor:'pointer'}} variant="h5" color="inherit" noWrap>
            Postmash
          </Typography>
          <p style={{position:'absolute', right:'0', marginRight: '2.5rem', textTransform:'uppercase', letterSpacing:"1px", cursor:'default'}}>{userName}</p>
        </Toolbar>
        
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sl">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Postmash   <br/>A Online People's Memory Saver
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Postmash is a Social Media App where you can Share your Unforgetable memories here. 
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={1}
              justifyContent="center"
            >
              <Box sx={{ '& > :not(style)': { m: 0 , width:"10rem" , borderRadius:"5rem", gap:"1rem"} }}>
                <Fab onClick={createPost} color="primary" aria-label="edit">
                    <EditIcon />Post Now
                </Fab>
            </Box>
              <Box sx={{ '& > :not(style)': { m: 0 , width:"10rem" , borderRadius:"5rem", gap:"1rem"} }}>
                <Fab onClick={myPosts} color="primary" aria-label="edit">
                {(my)? "My Posts":"All Posts"}
                </Fab>
            </Box>
              <Box sx={{ '& > :not(style)': { m: 0 , width:"10rem" , borderRadius:"5rem", gap:"1rem"} }}>
                <Fab color="primary" aria-label="edit">
                  <Link onClick={handleSubmit} style={{textDecoration:'none', width:"10rem", color:'white', padding:'1rem'}} href={navigate}>{(currentUser)? 'sign out' : 'register'}</Link>
                </Fab>
            </Box>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {(cards)? cards?.map((card) => (
              <Grid item key={card.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <ImageList
                      sx={{ width: "auto", height: 300,}}
                      variant="quilted"
                      cols={1}
                      rowHeight={300}
                    >
                   <ImageListItem key={card.photoURL} cols={card.cols || 1} rows={card.rows || 1}>
                    <img
                      {...srcset(card.photoURL, 121, card.rows, card.cols)}
                      alt=""
                      loading="lazy"
                    />
                  </ImageListItem>
                  </ImageList>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {card.description}
                    </Typography>
                    <Typography>
                      {/* This is a media card. You can use this section to describe the
                      content. */}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {(currentUser && currentUser.uid === card.userID)? 
                    <><Button onClick={() => deletePost(card)} size="small">Delete</Button></>
                    : null}
                  </CardActions>
                </Card>
              </Grid>
            )): <div className='empty'>
                  <div className='empty-icon'><SlCamera fontSize="40px"/></div>
                  <h1>No Posts Yet</h1>
                </div>}
          </Grid>
        </Container>
      </main>
      <Modal id="modal"
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div id='titleframe'>
            <p id='title'>Create new Post</p>
            <Button onClick={uploadData} variant="outlined" style={{borderRadius:"5rem",padding:'5px 20px'}}>Next</Button>
          </div>
         <div className="container">
         <form id='form-1'>
          <div><RiImageAddFill fontSize='4rem'/></div>
            <input required type="file" onChange={(e)=> setFileValue(e.target.files[0])} name='file'/>
          </form> 
         <form id='form-2'>
         <textarea onChange={(e)=> setTextValue(e.target.value)} placeholder='Write description...' id='description' name="textarea">{textValue}</textarea>
         {loading && "Uploading and compressing the image please wait..."}
          {err && <span>Something went wrong</span>}
          </form> 
          
         </div>
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

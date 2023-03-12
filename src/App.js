import React, { useEffect, useState } from 'react'
import "./App.css"
import { BrowserRouter , Route, Routes } from "react-router-dom";

import Album from './template/Album'
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const App = () => {
  const [loading, setLoading] = useState(false);
    // im getting globally uploaded posts
    const [datas, setDatas] = useState([])
useEffect(()=>{
    try {
      const getDatas = async () => {
        setLoading(true); setTimeout(() => { setLoading(false); }, 3000);
        const docRef = collection(
          db,
         "Posts"
        );
  
        const querySnapshot  = await getDocs(docRef);
        
        await querySnapshot.forEach((doc) => {
          if ( doc.exists()) {
            setDatas( doc.data());
            setDatas(() => ({ ...doc.data() }));
          }
        });
      };
      getDatas();
    } catch (error) {
      console.log({ error });
    }
  },[]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              loading? <div className='body'> <div class="loader">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div></div> : datas && <Album  value={datas}/>
            }
          />
          <Route path="login" element={<SignIn />} />
          <Route path="register" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
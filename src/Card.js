import { Button, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import { Container } from '@mui/system';
import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'


const Card = () => {
//  const [cards, setCards] = useState()
  const db = getDatabase();
  const dbRef = ref(db, 'usersPosts');
  
  // var cards = 2
  useEffect(() => {
    
    const unsubs = onValue(dbRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        // ...
        // console.log(childData) 
      });  
    });
    
    return () => {
      unsubs();
    }
  }, [])
  
  
   
  return (
    <div>
        
    </div>
  )
}

export default Card
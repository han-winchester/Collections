import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CreateCollectionForm from './CreateCollectionForm';
import CollectionForm from './CollectionForm';
import SearchCollections from './SearchCollections';
import collectionService from '../helpers/collectionService';
import { UserContext, RoomContext } from './../UserContext';
import { ApiContext } from '../ApiContext';

function Collections() {
  const {user, setUser} = useContext(UserContext)
  const {room} = useContext(RoomContext);

  const history = useHistory();

  var storage = require('../../tokenStorage.js');

  // Initial States
  const [message,setMessage] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState([])

  const handleLogout = () => {
    storage.clearTokens();
    setUser(null);
    collectionService.setToken(null);
    history.push('/');
  }

  // only fires at beginning
    useEffect(() => {
    (async () => {
      try{
        setIsLoading(true);

        const res = await collectionService.getAll(room.id,);

        if(res.error){
          setError(true);
          setMessage(res.error);
          return;
        }
        setCollections(res.collections);
        setIsLoading(false);
      }catch(exception){
        setError(true);
        console.log(exception);
      }
    })()
  },[user])
    
  const doCreate = async (collection) => {
    try{
      const res = await collectionService.create(collection);

      if(res.error){
        return res;
      }

      const newCollections = [...collections, res];
      setCollections(newCollections);
    }catch(exception){
      console.log(exception);
    }
  }

  const doSearch = async (search) => {
    try{
      const res = await collectionService.search(search, user.id);

      if(res.error){
        return res;
      }

      setCollections(res);
    }catch(exception){
      console.log(exception);
    }
  }


  const doDelete = async (collectionID) => {
    try{
      const res = await collectionService.deleteCollection(collectionID);

      if(res.error){
        return res;
      }

      setTimeout(function(){
        setCollections(collections.filter(collection => collection.id !== collectionID));
        return res;
      },1000)

      return true;
    }catch(exception){
      console.log(exception);
    }
  }

  const doUpdate = async ( collectionID, newCollection ) => {
    try{
      const res = await collectionService.update(collectionID, newCollection);

      if(res.error){
        return res;
      }

      setTimeout(function(){
        setCollections(collections.map(collection => {
          if(collectionID === collection.id){
            return {...collection, ...newCollection}
          }

          return collection;
        }))
      }, 500);
    }catch(exception){
      console.log(exception);
    }
  }


    // If UseEffect hasn't finished then show loading message
    if(isLoading){
        return(
            <h4>Loading Webpage</h4>
        );
    }else{
        return(
            <div>
                <ApiContext.Provider value={{doUpdate, doDelete, doSearch, doCreate}}>
                    <Grid container spacing={3}>
                        {/* Set up in to rows of length 12 */}
                        <Grid item xs={12}/>

                        {/* Begin Row (This row is split into 2+5+5=12)*/}
                        <Grid item xs={2}/>
                        <Grid item xs={5}>    
                            <SearchCollections/>                    
                        </Grid>
                        <Grid item xs={5}>
                            <Button variant="contained" size="large" color="secondary" type="submit" id="loginButton" className="buttons" value="Sign Out" onClick={()=>{handleLogout()}}>Sign Out</Button>
                            <Button variant="contained" size="large" color="primary" type="submit" id="roomButton" className="buttons" value="Back to Rooms" onClick={()=>{history.push("/museum")}}>Back to Rooms</Button> <br />
                        </Grid>
                        {/* End Row */}

                        {/* single row of nothing. Im using this to space things out */}
                        <Grid item xs={12}/>

                        {/* Begin Row */}
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                           <span id="displayCollection"><h1>{room.name} Collections</h1></span>  
                            <CollectionForm collections={collections}/>
                            {error && <div>{message}</div>}
                        </Grid>
                        <Grid item xs={2}/>
                        <Grid item xs={5}>
                            <CreateCollectionForm/>
                        </Grid>
                        {/* End Row */}

                        <Grid item xs={12}/>
                    </Grid>
                    </ApiContext.Provider>
            </div>
        )
    }
}

export default Collections;
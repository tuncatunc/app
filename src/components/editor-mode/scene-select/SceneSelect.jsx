
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import * as universe from '../../../../universe.js'
import sceneNames from '../../../../scenes/scenes.json';

import styles from './scene-select.module.css';

//

export const SceneSelect = ({ multiplayerConnected, selectedScene, setSelectedScene, selectedRoom, setSelectedRoom }) => {

    const [ rooms, setRooms ] = useState([]);
    const [ scenesMenuOpened, setScenesMenuOpened ] = useState( false );
    const [ roomsMenuOpened, setRoomsMenuOpened ] = useState( false );

    //

    const _makeName = ( N = 8 ) => ( Math.random().toString(36) + '00000000000000000' ).slice( 2, N + 2 );

    const refreshRooms = async () => {

        const res = await fetch( universe.getWorldsHost() );

        if ( res.ok ) {

            const rooms = await res.json();
            setRooms( rooms );

        } else {

            const text = await res.text();
            console.warn( 'failed to fetch', res.status, text );

        }

    };

    useEffect( () => {

        refreshRooms();
        window.addEventListener( 'mousedown', handleOnFocusLost );

        return () => {

            window.removeEventListener( 'mousedown', handleOnFocusLost );

        };

    }, [] );

    //

    const handleOnFocusLost = () => {

        setScenesMenuOpened( false );
        setRoomsMenuOpened( false );

    };

    const handleSceneMenuOpen = ( value, event ) => {

        value = ( typeof value === 'boolean' ? value : ( ! scenesMenuOpened ) );
        setScenesMenuOpened( value );
        setRoomsMenuOpened( false );

    };

    const handleSceneSelect = ( event, sceneName ) => {

        sceneName = sceneName ?? event.target.value;
        setSelectedScene( sceneName );
        universe.pushUrl( `/?src=${ encodeURIComponent( './scenes/' + sceneName ) }` );
        setScenesMenuOpened( false );

    };

    const handleRoomMenuOpen = ( value, event ) => {

        value = ( typeof value === 'boolean' ? value : ( ! roomsMenuOpened ) );
        setScenesMenuOpened( false );

        if ( ! multiplayerConnected ) {

            setRoomsMenuOpened( value );

        } else {

            universe.pushUrl( `/?src=${ encodeURIComponent( selectedScene ) }` );

        }

    };

    const handleRoomCreateBtnClick = async () => {

        const roomName = _makeName();
        const data = Z.encodeStateAsUpdate( world.getState( true ) );

        const res = await fetch( universe.getWorldsHost() + roomName, { method: 'POST', body: data } );

        if ( res.ok ) {

            refreshRooms();
            setSelectedRoom( roomName );
            universe.pushUrl( `/?src=${ encodeURIComponent( sceneName ) }&room=${ roomName }` );

            /* this.parent.sendMessage([
                MESSAGE.ROOMSTATE,
                data,
            ]); */

        } else {

            const text = await res.text();
            console.warn( 'error creating room', res.status, text );

        }

    };

    const handleRoomSelect = () => {

        if ( ! world.isConnected() ) {

            universe.pushUrl( `/?src=${ encodeURIComponent( selectedScene ) }&room=${ room.name }` );

            /* const isConnected = world.isConnected();
            setMultiplayerConnected(isConnected);
            if (isConnected) {
              setRoomName(room.name);
              setMultiplayerOpen(false);
            } */

        }

    };

    const handleDeleteRoomBtnClick = async () => {

        const res = await fetch( universe.getWorldsHost() + selectedRoom.name, { method: 'DELETE' } );

        if ( res.ok ) {

            refreshRooms();
            // const newRooms = rooms.slice().splice(rooms.indexOf(room), 1);
            // setRooms(newRooms);

        } else {

            const text = await res.text();
            console.warn( 'failed to fetch', res.status, text );

        }

    };

    const handleSceneInputKeyPress = ( event ) => {

        switch ( event.which ) {

            case 13: { // enter

                event.preventDefault();
                universe.pushUrl( `/?src=${ encodeURIComponent( selectedScene ) }` );
                break;

            }

        }

    };

    //

    return (
        <div className={ styles.location }>
            <div className={ styles.row }>
                <div className={ styles['button-wrap'] } onMouseUp={ handleSceneMenuOpen.bind( this, null ) }>
                    <button className={ classnames( styles.button, styles.primary, scenesMenuOpened ? null : styles.disabled ) }>
                        <img src="images/webarrow.svg" />
                    </button>
                </div>
                <div className={ styles['input-wrap'] }>
                    <input type="text" className={ styles.input } value={ multiplayerConnected ? selectedRoom : selectedScene } onFocus={ handleSceneMenuOpen.bind( this, false ) } onChange={ handleSceneSelect } disabled={ multiplayerConnected } onKeyDown={ handleSceneInputKeyPress } placeholder="Goto..." />
                    <img src="images/webpencil.svg" className={ classnames( styles.background, styles.green ) } />
                </div>
                <div className={ styles['button-wrap'] } onMouseUp={ handleRoomMenuOpen.bind( this, null ) }>
                    <button className={ classnames( styles.button, ( roomsMenuOpened || multiplayerConnected ) ? null : styles.disabled ) }>
                    <img src="images/wifi.svg" />
                </button>
            </div>
        </div>

        {
            scenesMenuOpened ? (
                <div className={ styles.rooms }>
                {
                    sceneNames.map( ( sceneName, i ) => (
                        <div className={ styles.room } onMouseDown={ ( e ) => { handleSceneSelect( e, sceneName ) } } key={ i }>
                            <img className={ styles.image } src="images/world.jpg" />
                            <div className={ styles.name }>{ sceneName }</div>
                        </div>
                    ))
                }
                </div>
            ) : null
        }

        {
            roomsMenuOpened ? (
                <div className={ styles.rooms }>
                    <div className={ styles.create }>
                        <button className={ styles.button } onMouseDown={ handleRoomCreateBtnClick }>Create room</button>
                    </div>
                    {
                        rooms.map( ( room, i ) => (
                            <div className={ styles.room } onMouseDown={ ( e ) => { handleRoomSelect( e, roomName ) } } key={ i }>
                                <img className={ styles.image } src="images/world.jpg" />
                                <div className={ styles.name }>{ room.name }</div>
                                <div className={ styles.delete }>
                                    <button className={ classnames( styles.button, styles.warning ) } onMouseUp={ handleDeleteRoomBtnClick }>Delete</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            ) : null
        }

        </div>
    );

};
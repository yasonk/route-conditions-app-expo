// @flow

import {Dispatch} from 'redux';
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {indexReports} from "../../models/ReportsClient";

const superagent = require( 'superagent' );

const REFRESH_REPORTS_REQUEST_ACTION = 'REFRESH_REPORTS_REQUEST_ACTION';
const REFRESH_REPORTS_DONE_ACTION = 'REFRESH_REPORTS_DONE_ACTION';
const REFRESH_REPORTS_FAILED_ACTION = 'REFRESH_REPORTS_FAILED_ACTION';

const CURRENT_LOCATION_REQUEST_ACTION = 'CURRENT_LOCATION_REQUEST_ACTION';
const CURRENT_LOCATION_DONE_ACTION = 'CURRENT_LOCATION_DONE_ACTION';
const CURRENT_LOCATION_FAIL_ACTION = 'CURRENT_LOCATION_FAIL_ACTION';

const SUBMIT_REPORT_REQUEST_ACTION = 'SUBMIT_REPORT_REQUEST_ACTION';
const SUBMIT_REPORT_DONE_ACTION = 'SUBMIT_REPORT_DONE_ACTION';
const SUBMIT_REPORT_FAIL_ACTION = 'SUBMIT_REPORT_FAIL_ACTION';


export function isRefreshReportsRequestAction ( action ) {
    return action.type === REFRESH_REPORTS_REQUEST_ACTION;
}

//Define your action create that set your loading state.
export function createRefreshReportsRequestAction ( loading ) {
    //return a action type and a loading state indicating it is getting data. 
    return {
        type: REFRESH_REPORTS_REQUEST_ACTION,
        loading: loading,
    };
}

export function isRefreshReportsDoneAction ( action ) {
    return action.type === REFRESH_REPORTS_DONE_ACTION;
}

//Define a action creator to set your loading state to false, and return the data when the promise is resolved
export function createRefreshReportsDoneAction ( reports ) {
    //Return a action type and a loading to false, and the data.
    return {
        type: REFRESH_REPORTS_DONE_ACTION,
        reports: reports,
        loading: false,
    };
}

export function isRefreshReportsFailedAction ( action ) {
    return action.type === REFRESH_REPORTS_FAILED_ACTION;
}

//Define a action creator that catches a error and sets an errorMessage
export function createRefreshReportsFailedAction ( error ) {
    //Return a action type and a payload with a error
    return {
        type: REFRESH_REPORTS_FAILED_ACTION,
        error: error,
        loading: false,
    };
}

//Define your action creators that will be responsible for async operations
export const refreshReports = ( authToken, init = true ) => {
    return ( dispatch: Dispatch ) => {
        dispatch( createRefreshReportsRequestAction( init ) );
        indexReports(authToken,
            (err) =>  dispatch( createRefreshReportsFailedAction( err )),
            (reports) => dispatch( createRefreshReportsDoneAction( reports )));

        return setTimeout( () => refreshReports(authToken, false)( dispatch ), 15000 );
    }
}

export function isCurrentLocationRequestAction ( action ) {
    return action.type === CURRENT_LOCATION_REQUEST_ACTION;
}

export function createCurrentLocationRequestAction () {
    return {
        type: CURRENT_LOCATION_REQUEST_ACTION,
    };
}

export function isCurrentLocationDoneAction ( action: { type: CURRENT_LOCATION_DONE_ACTION } ) {
    return action.type === CURRENT_LOCATION_DONE_ACTION;
}

export function createCurrentLocationDoneAction ( location: LocationObject ) {
    return {
        type: CURRENT_LOCATION_DONE_ACTION,
        location: location,
    };
}

export function isCurrentLocationFailedAction ( action ) {
    return action.type === CURRENT_LOCATION_FAIL_ACTION;
}

export function createCurrentLocationFailedAction ( error ) {
    return {
        type: CURRENT_LOCATION_FAIL_ACTION,
        payload: error,
    };
}

export function refreshCurrentPosition () {
    return async ( dispatch: Dispatch ) => {
        dispatch( createCurrentLocationRequestAction() );

        let {status} = await Location.requestPermissionsAsync();
        if ( status !== 'granted' ) {
            return;
        }
        //TODO: handle failure

        const location = await Location.getCurrentPositionAsync( {} );
        dispatch( createCurrentLocationDoneAction( location ) )
        return setTimeout( () => refreshCurrentPosition()( dispatch ), 10000 );
    }
}

export function isSubmitReportRequestAction ( action ) {
    return action.type === SUBMIT_REPORT_REQUEST_ACTION;
}

export function createSubmitReportRequestAction () {
    return {
        type: SUBMIT_REPORT_REQUEST_ACTION,
    };
}

export function isSubmitReportDoneAction ( action: { type: SUBMIT_REPORT_DONE_ACTION } ) {
    return action.type === SUBMIT_REPORT_DONE_ACTION;
}

export function createSubmitReportDoneAction ( location: LocationObject ) {
    return {
        type: SUBMIT_REPORT_DONE_ACTION,
        location: location,
    };
}

export function isSubmitReportFailedAction ( action ) {
    return action.type === SUBMIT_REPORT_FAIL_ACTION;
}

export function createSubmitReportFailedAction ( error ) {
    return {
        type: SUBMIT_REPORT_FAIL_ACTION,
        payload: error,
    };
}

export function submitReport ( authToken, report ) {
    return async ( dispatch: Dispatch ) => {
        dispatch( createSubmitReportRequestAction() );

        //TODO: handle failure
        //TODO: on Success display message to user

        superagent.post( 'http://192.168.1.20:3000/reports' )
            .send({authToken, report})
            .set( {
                "Authorization": authToken,
                "Content-Type": "application/json",
                "Accept": "application/json"
            } ).end( ( err, res ) => {
            //if there is an error use our refreshReportsReject
            if ( err ) dispatch( createSubmitReportFailedAction( err ) );
            //We will set our loading state when fetching data is successful.
            if ( res ) {
                dispatch( createSubmitReportDoneAction( res.body ) );
                refreshReports( authToken, false )( dispatch );
            }
        } );
    }
}
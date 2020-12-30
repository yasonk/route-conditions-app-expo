import { format } from "date-fns";

const superagent = require( 'superagent' );

export function indexReports(authToken, errorCallback, successCallback) {

    superagent.get( 'http://192.168.1.20:3000/reports' )
        .set( {
            "Authorization": authToken,
            "Accept": "application/json"
        } ).end( ( err, res ) => {
        //TODO: handle bad response code. For example, should not trigger createRefreshReportsDoneAction, also
        // reduce must not allow null payload to ruin everything
        if ( err ) {
            errorCallback(err);
        } else if( res ) {
            const reports = res.body.map(transformReport);
            successCallback(reports);
        }
    } );
}

function transformReport(report) {
    const myReport = {...report}
    const date = new Date(report.created_at);
    myReport.created_at = format(date, "MMM do, yyyy H:mma");
    return myReport;
}
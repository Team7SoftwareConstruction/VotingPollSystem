
export default class Poll {


    constructor(email, id,  pollData) {
        let newCol = document.getElementById(id);
        if (newCol == null) 
            newCol = document.createElement("div");
            newCol.id = id;
            newCol.className = "col";
        
        let htmlPollSelections = "<div class='bg-white rounded-lg p-5 shadow'>";
        let htmlPass;
        let owner;
        let pollDetails;
        if (pollData.public)
            pollDetails = "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-primary'>Public</span><span class='badge badge-pill badge-secondary'>Show Percents: " + pollData.viewPercent + "</span></div>"
        else 
        pollDetails = "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-danger'>Private</span><span class='badge badge-pill badge-secondary'>Show Percents: " + pollData.viewPercent + "</span></div>"
        let hasVotedLabel;
        let hasVotedName;
        let hasVoted = false;
        pollData.voters.forEach(voter => {
            if(Object.values(voter).includes(email)) {
                hasVoted = true;
                hasVotedName = voter['selectionName'];
            }
        });

        pollData.selections.forEach(selection => {
            let name = selection.selectionName
            let sel;
            let selVotes;
            if(pollData.owner == email) {
                owner = "<div class='row justify-content-center'><span class='badge badge-pill badge-warning'>Owner</span></div>"
                selVotes = "<div class='col' style='padding-left:1rem;'><span class='badge badge-pill badge-warning'>" + selection.votes + " Votes</span></div>"
            }
            else {
                owner = "";
                selVotes = "";
            }

            if(hasVoted)
                hasVotedLabel = "<div class='row justify-content-center'><span class='badge badge-pill badge-danger'>You've Voted</span></div>"
            else
                hasVotedLabel = "";

            if (name == hasVotedName)
                hasVotedName = "<span class='material-icons' style='color: green; padding-left:1rem;'> check_circle </span>";
            else
                hasVotedName = "";


            if(hasVoted || pollData.owner == email) {
                sel = "<div class='row justify-content-center'>"
                    + "<div class='col align-self-center'>"
                    + "<h2 class='display-5 text-center'>" + name + hasVotedName + selVotes + "</h2>"
                    + "</div></div>"

            } else {
                sel = "<div class='row justify-content-center'>"
                    + "<div class='col align-self-center'>"
                    + "<h2 class='display-5'>" + name + "</h2>"
                    + "</div>"
                    + "<div class='col align-self-center'>"
                    + "<button type='button' class='btn btn-warning'>VOTE</button>"
                    + "</div></div>"
            }

            if(pollData.totalVotes > 0 && pollData.viewPercent) {
                var votePct = (Number(selection.votes) * 100) / Number(pollData.totalVotes);
                var selStats = "<div class='row'>"
                + "<div class='progress-bar-striped progress-bar-animated bg-primary' role='progressbar' style='width: " + votePct + "%; text-align: center; color: white;' aria-valuenow='" + votePct + "' aria-valuemin='0' aria-valuemax='100'>" + votePct + "% </div>"
                + "</div>";
                htmlPass = sel + selStats;
            } else {
                htmlPass = sel;
            }
            htmlPollSelections = htmlPollSelections + htmlPass;
        })
        htmlPollSelections = htmlPollSelections + "</div>";


        $(newCol).html("<div class='bg-white rounded-lg p-5 shadow'>"
             + hasVotedLabel
             + owner
             + pollDetails
             + "<div class='row justify-content-center'><h3>" + pollData.pollName + "</h3></div>"
             + "<div class='row text-center mt-4'>" 
             + "<div class='col-6 border-right'>"
             + "<div class='h5 font-weight-bold mb-0 text-primary'>" + pollData.startDate + "</div>"
             + "<span class='small text-gray'> Start Date </span>"
             + "</div>"
             + "<div class='col-6'>"
             + "<div class='h5 font-weight-bold mb-0 text-primary'>" + pollData.startTime + "</div>"
             + "<span class='small text-gray'>Start Time</span>"
             + "</div>"
             + "</div>"
             + "<br>"
             + htmlPollSelections
             + "<div class='row text-center mt-4'>" 
             + "<div class='col-6 border-right'>"
             + "<div class='h5 font-weight-bold mb-0 text-danger'>" + pollData.endDate + "</div>"
             + "<span class='small text-gray'>End Date </span>"
             + "</div>"
             + "<div class='col-6'>"
             + "<div class='h5 font-weight-bold mb-0 text-danger'>" + pollData.endTime + "</div>"
             + "<span class='small text-gray'>End Time</span>"
             + "</div>"
             + "</div>"
             + "</div></div>");

        return newCol;
    }
}

export default class Poll {
    // This is the Constructor to initialize Poll Data Values and Construct Poll Element
    constructor(email, id,  pollData) {
        // Store all important data of Poll within the instance.
        this.id = id;
        this.currUserEmail = email;
        this.pollData = pollData;
        this.hasVoted = false;
        this.hasVotedSelection = "";

        // Return the Constructed Poll Element
        return this.constructPoll();
    }

    // This function is used to create the Poll Element of the current Poll Instance.
    constructPoll() {
        // Check if the current User has voted on this poll.
        this.checkHasVoted();

        // Create the Poll Element
        let newPoll = this.createPollElement();

        // Get the Has Voted Label Element
        let hasVotedLabel = this.hasVotedLabelElement();

        // Get the Poll Name Element
        let pollName = this.getHeadingElement(this.pollData.pollName);

        // Get the Owner Label Element
        let ownerLabel = this.getOwnerLabelElement();

        // Get the Active Poll Details Element
        let pollActiveDetails = this.getActiveElement();

        // Get the Public Poll Details Element
        let pollPublicDetails = this.getPublicElement();

        // Get the Starting Time Frame Element (Start Date & Time)
        let startTimeFrame = this.getStartTimeFrame(true)

        // Get the Ending Time Frame Element (End Date & Time)
        let endTimeFrame = this.getStartTimeFrame(false);

        // Get the Selections of the Poll Element
        let htmlPollSelections = this.createSelectionsElement();

        // Construct the HTML Code of the created Poll Element using the info elements.
        $(newPoll).html("<div class='bg-white rounded-lg p-5 shadow'>"
             + hasVotedLabel
             + ownerLabel
             + pollPublicDetails
             + pollName
             + startTimeFrame
             + "<br>"
             + htmlPollSelections
             + endTimeFrame
             + pollActiveDetails
             + "</div>");

        // Return the newly constructed Poll
        return newPoll;
    }

    // This function checks to see if the Current User has voted on this Poll.
    checkHasVoted() {
        // Check each Voter of this Poll
        this.pollData.voters.forEach(voter => {
            
            // If current Voter contains the Current User Email then Current User has Voted.
            if(Object.values(voter).includes(this.currUserEmail)) {
                this.hasVoted = true;
                this.hasVotedSelection = voter['selectionName'];
            }
        });
    }

    // This function is used to create the Poll Div Element
    createPollElement() {
        // Check to see if poll has already been made.
        var currPoll = document.getElementById(this.id);

        // If Current Poll doesn't exist, make new Div element and set attributes.
        if (currPoll == null) {
            currPoll = document.createElement("div");
            currPoll.id = this.id;
            currPoll.className = "col";
        }

        // Return created Poll Div Element
        return currPoll;
    }

    // This function is used to get the Has Voted Label Element
    hasVotedLabelElement() {
        // If Current User has voted return Has Voted Label else return nothing.
        if(this.hasVoted)
            return "<div class='row justify-content-center'><span class='badge badge-pill badge-danger'>You've Voted</span></div><br>"
        else
            return "";
    }

    // This function is used to create Heading Element of the given Heading Text. [USED FOR POLL TITLE]
    getHeadingElement(headingText) {
        return "<div class='row justify-content-center'><h3 class='text-center'>" + headingText + "</h3></div>";
    }
    
    // This function is used to get the Owner Label Element
    getOwnerLabelElement() {
        // If Current User is the owner of the poll return Owner Label else return nothing.
        if(this.pollData.owner == this.currUserEmail)
            return "<div class='row justify-content-center'><span class='badge badge-pill badge-warning'>Owner</span></div><br>";
        else 
            return "";
    }

    // This function is used to get the Active Element
    getActiveElement() {
        // If the Poll is Active then return with Active Label else return Inactive Label
        if (this.pollData.active)
            return "<br><div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-success'>Active</span><span class='badge badge-pill badge-danger'>Show Percents: " + this.pollData.viewPercent + "</span></div>";
        else 
            return "<br><div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-danger'>InActive</span><span class='badge badge-pill badge-danger'>Show Percents: " + this.pollData.viewPercent + "</span></div>";
    }

    // This function is used to get the Public Element
    getPublicElement() {
        let totalVotes = this.getTotalVotesElement();
        // If the Poll is Public then return Public Label else return Private Label
        if (this.pollData.public)
            return "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-primary'>Public</span><span class='badge badge-pill badge-danger'>Total Votes: " + this.pollData.totalVotes + "</span></div><br>";
        else 
            return  "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-danger'>Private</span>" + totalVotes + "</div><br>";
    }

    getTotalVotesElement() {
        if (this.currUserEmail == this.pollData.owner)
            return "<span class='badge badge-pill badge-danger'>Total Votes: " + this.pollData.totalVotes + "</span>";
        else 
            return "";
    }

    // This function is used to create the ENTIRE Selections Element
    createSelectionsElement() {  
        // Create the Starting Tag for the Entire Selections Element     
        let selectionsElement = "<div class='bg-white rounded-lg p-5 shadow'>" + this.getHeadingElement("Selections Below") + "<br>";

        //Go through each selection and make the Individual Selection Element for the Poll.
        this.pollData.selections.forEach(selection => {
            let selectionElement = this.createSelectionElement(selection) + this.showPercentsElement(selection);
            
            // Add the newly created Selection Element to the Entire Selections Element
            selectionsElement = selectionsElement + "<div class='bg-white rounded-lg p-5 border border-dark rounded shadow-lg'>" + selectionElement + "</div>";
        })

        // Close the Starting Tag and return the Entire Selections Element
        return selectionsElement + "</div>";
    }

    // This function is used to create the INDIVIDUAL Selection Element
    createSelectionElement (selection) {
        // Gets Checkmark if Voted else Blank
        let selCheckmark = this.getSelCheckmark(selection);

        // Gets Votes for Selection if Owner else Blank
        let selVotes = this.getSelVotesElement(selection);

        if(this.hasVoted || this.pollData.owner == this.currUserEmail) {
            return "<div class='row justify-content-center'>"
                + "<div class='col align-self-center'>"
                + "<h2 class='display-5 text-center'>" + selection.selectionName + selCheckmark + selVotes + "</h2>"
                + "</div></div>"
        } else {
            return "<div class='row justify-content-center'>"
                + "<div class='col align-self-center'>"
                + "<h2 class='display-5'>" + selection.selectionName + "</h2>"
                + "</div>"
                + "<div class='col align-self-center'>"
                + "<button type='button' class='btn btn-warning'>VOTE</button>"
                + "</div></div>"
        }
    }
    
    // This function is used to get the Selection Votes Element
    getSelVotesElement(sel) {
        // If the Current User is the Owner of this Poll then return Selection Votes else return nothing.
        if(this.pollData.owner == this.currUserEmail)
            return "<div class='col' style='padding-left:1rem;'><span class='badge badge-pill badge-warning'>" + sel.votes + " Votes</span></div>"
        else 
            return "";
    }

    // This function is used to get the Selection Checkmark
    getSelCheckmark(sel) {
        // If the Has Voted Selection is equal to the Selection Name return Checkmark else return nothing.
        if (sel.selectionName == this.hasVotedSelection)
            return "<span class='material-icons' style='color: green; padding-left:1rem;'> check_circle </span>";
        else
            return "";
    }

    // This function is used to show the Percents of this Poll.
    showPercentsElement(selection) {
        // If the Total Votes is more than 0 and this poll was set to Show Percent
        if(this.pollData.totalVotes > 0 && this.pollData.viewPercent) {
            var votePct = ((Number(selection.votes) * 100) / Number(this.pollData.totalVotes)).toFixed(2);
            let votePctElement = "<h4 style='text-left'>" + votePct + "%</h4>"

            return "<br><div class='row'><div class ='col'>" + votePctElement + "</div>"
            + "<div class ='col'><div class='progress-bar-striped progress-bar-animated bg-primary' role='progressbar' style='width: " + votePct + "%; height: 2rem; color: blue;' aria-valuenow='" + votePct + "' aria-valuemin='0' aria-valuemax='100'><p style='visibility:hidden'>" + votePct + "</p></div></div>"
            + "</div>";
        }
        return "";
    }

    // This function is used to get the Time Frame for Start and End (Time & Date)
    getStartTimeFrame(isStart) { 
        let date;
        let time;

        if (isStart) {
            date = this.pollData.startDate;
            time = this.pollData.startTime;
        } else {
            date = this.pollData.endDate;
            time = this.pollData.endTime;
        }

        return "<div class='row text-center mt-4'>" 
        + "<div class='col-6 border-right'>"
        + "<span class='small text-gray'> <b style='color: blue;'>Start Date</b> </span>"
        + "<div class='h5 font-weight-bold mb-0 text-primary'>" + date + "</div>"
        + "</div>"
        + "<div class='col-6'>"
        + "<span class='small text-gray'><b style='color: blue;'>Start Time</b></span>"
        + "<div class='h5 font-weight-bold mb-0 text-primary'>" + time + "</div>"
        + "</div>"
        + "</div>"
    }
}
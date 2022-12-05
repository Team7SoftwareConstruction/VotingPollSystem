
export default class Poll {
    // This is the Constructor to initialize Poll Data Values and Construct Poll Element
    constructor(email, id,  pollData) {
        // Store all important data of Poll within the instance.
        this.id = id;
        this.currUserEmail = email;
        this.pollData = pollData;
        this.hasVoted = false;
        this.hasVotedSelection = "";
        this.colors = ['primary', 'danger', 'info', 'secondary', 'dark']

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
        let pollName = this.createTitleHeader();

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

        let percentBar = this.createFullPercentBar();
        
        let selectionsBar = this.createFullPercentSelectionsBar();

        // This is where the CountDown Timer and if not shown -> Deadline Reached
        //let deadlineTitle = this.createDeadlineTitle();

        let showResultsTitle = this.createShowResultsTitle();

        // Construct the HTML Code of the created Poll Element using the info elements.
        $(newPoll).html(pollName + "<div class='bg-white rounded-lg p-5 shadow'>"
             + hasVotedLabel
             + ownerLabel
             + pollPublicDetails
             + startTimeFrame
             + "<br>"
             + showResultsTitle
             + htmlPollSelections
             + selectionsBar
             + percentBar
             + endTimeFrame
             + pollActiveDetails
             + "</div>");

        // Return the newly constructed Poll
        return newPoll;
    }

    createShowResultsTitle() {
        let winningText;
        let showResultsColor;
        let showResultsTitle;
        let textColor;
        if (this.pollData.winner.length > 1 && this.pollData.showResults) {
            winningText= "<b>Tie</b> is<b> Highlighted</b> in<b> YELLOW</b> "
            showResultsColor = 'warning'
            textColor = " text-dark"
        }else if (this.pollData.winner.length == 1 && this.pollData.showResults){
            winningText = "<b>Winner</b> is<b> Highlighted</b> in<b> GREEN</b> "
            showResultsColor = 'success'
            textColor = " text-dark";
        } else {
            winningText = "Selections Listed Below"
            showResultsColor = 'dark'
            textColor =" ";
        }
        showResultsTitle = this.getHeadingElement(winningText);

        return "<div class='card-header bg-"+showResultsColor+textColor+"progress-bar progress-bar-striped progress-bar-animated p-4'>" + showResultsTitle + "</div>"
    }

    createDeadlineTitle() {
        let deadlineTitle = "";
        if (this.pollData.showResults) {
            deadlineTitle = "<div class='card-footer bg-danger progress-bar progress-bar-striped progress-bar-animated p-3'>" + this.getHeadingElement("DEADLINE REACHED") + "</div>"
        }
        return deadlineTitle;
    }

    createTitleHeader() {
        let activeColor
        if (this.pollData.showResults || !this.pollData.active) {
            activeColor = 'danger'
        } else {
            activeColor = 'success'
        }
        return "<div class='card-header progress-bar progress-bar-striped progress-bar-animated bg-"+activeColor+" mt-5 p-3 shadow'>" + this.getHeadingElement(this.pollData.pollName) + "</div>"
    }

    // This function checks to see if the Current User has voted on this Poll.
    checkHasVoted() {
        // Check each Voter of this Poll
        this.pollData.voters.forEach(voter => {
            
            // If current Voter contains the Current User Email then Current User has Voted.
            if(Object.values(voter).includes(this.currUserEmail)) {
                this.hasVoted = true;
                this.hasVotedSelection = voter['selectionIdx'];
            }
        });
    }

    // This function is used to create the Poll Div Element
    createPollElement() {
        // Check to see if poll has already been made.
        let currPoll = document.getElementById(this.id);

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
            return "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-primary'>Public</span><span class='badge badge-pill badge-danger'>Total Votes: " + this.pollData.totalVotes + "</span></div>";
        else 
            return  "<div class='row justify-content-left' style='justify-content: space-between;'><span class='badge badge-pill badge-danger'>Private</span>" + totalVotes + "</div>";
    }

    getTotalVotesElement() {
        if (this.currUserEmail == this.pollData.owner)
            return "<span class='badge badge-pill badge-danger'>Total Votes: " + this.pollData.totalVotes + "</span>";
        else 
            return "";
    }

    getSelectionBoxColor(idx) {
        let color;
        if(this.pollData.winner.includes(idx) && this.pollData.winner.length > 1 && this.pollData.showResults) {
            color = 'warning'
        }else if(this.pollData.winner.includes(idx) && this.pollData.showResults) {
            color = 'success'
        }else {
            color = 'white'
        }
        
        return color
    }

    createFullPercentSelectionsBar () {
        let selectionsBar = '<div class="row text-center mt-4"><div class="row" style= "width: 100%;">';
        //Go through each selection and make the Individual Selection Element for the Poll.
        this.pollData.selections.forEach((selection, idx) => {
            selectionsBar = selectionsBar + this.showPercentsIdx(selection, idx);
        })
        selectionsBar = selectionsBar + '</div></div>';
        return selectionsBar;

        
    }

    createFullPercentBar () {
        let fullBar = '<div class="row text-center"><div class="row" style= "width: 100%;">';
        //Go through each selection and make the Individual Selection Element for the Poll.
        this.pollData.selections.forEach((selection, idx) => {
            let color = this.colors[idx];
            fullBar = fullBar + this.showPercentsElementRevised(selection, color);
        })
        fullBar = fullBar + '</div></div>';
        return fullBar;
    }

    // This function is used to create the ENTIRE Selections Element
    createSelectionsElement() {  
        let selectionColor;
        // Create the Starting Tag for the Entire Selections Element     
        let selectionsElement = "<div class='bg-white rounded-lg p-5 shadow'>";

        //Go through each selection and make the Individual Selection Element for the Poll.
        this.pollData.selections.forEach((selection, idx) => {
            let selectionElement = this.createSelectionElement(selection, idx);
            selectionColor = this.getSelectionBoxColor(idx)
            // Add the newly created Selection Element to the Entire Selections Element
            selectionsElement = selectionsElement + "<div class='bg-" + selectionColor + " rounded-lg p-5 border border-dark rounded shadow-lg'>" + selectionElement + "</div>";
        })

        // Close the Starting Tag and return the Entire Selections Element
        return selectionsElement + "</div>";
    }
    

    // This function is used to create the INDIVIDUAL Selection Element
    createSelectionElement (selection, idx) {
        let votingElement;
        let selName;
        let isVisible;
        // Gets Checkmark if Voted else Blank
        let selCheckmark = this.getSelCheckmark(idx);

        // Gets Votes for Selection if Owner else Blank
        let selVotes = this.getSelVotesElement(selection);

        
        if (this.pollData.showResults && this.pollData.winner.includes(idx)) {
            selName = "<p class='display-3'>" + selection.selectionName + "</p>"
            isVisible = true
        } else if (this.pollData.showResults && !this.pollData.winner.includes(idx)) {
            selName = "<s class='text-muted'>" + selection.selectionName + "</s>"
            isVisible = false
        } else {
            isVisible = true
            selName = selection.selectionName
        }

        let selIndex = this.getSelIndex(idx, 'title', isVisible);

        if(this.hasVoted || this.pollData.owner == this.currUserEmail || (this.pollData.showResults && this.pollData.public)) {
            votingElement = "";
        } else {
            votingElement = "<div class='col'>"
            + "<button type='button' class='btn btn-warning btn-lg'><h3 class='p-2'><b>VOTE</b></h3></button>"
            + "</div>"
        }

        return "<div class='d-flex justify-content-around'>"
                + "<div class='col'>"
                + "<h1 class='display-3 text-center text-border' >" + selIndex + selName + selCheckmark + selVotes + "</h1>"
                + "</div>"+votingElement+"</div>"
    }

    // This function is used to display the index of the Selection.
    getSelIndex(idx, opt, addOpt){
        let selIdxStyle;
        if (opt == 'title') {
            if(addOpt) {
                selIdxStyle= "style='opacity:0.99;'";
            } else {
                selIdxStyle = "style='opacity:0.50; text-decoration: line-through;'"
            }
            return "<div class='col'><span class='badge badge-pill badge-dark' "+selIdxStyle+"><b>Selection " + (idx + 1) + "   </b></span></div>"
        }
        else {
            return "<span class='badge badge-pill badge-dark'><b>" + (idx + 1) + "</b></span></div><span class='material-icons'>keyboard_double_arrow_down</span>"
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
    getSelCheckmark(idx) {
        // If the Has Voted Selection is equal to the Selection Name return Checkmark else return nothing.
        if (idx == this.hasVotedSelection && this.hasVoted )
            return "<h4 class='text-center'><span class='material-icons' style='color: green; padding-left:1rem;'> check_circle </span> You Voted This Selection</h4>";
        else
            return "";
    }

    // This function is used to show the Percents of this Poll.
    showPercentsElement(selection) {
        /* Recreate this Percentage Display, so that instead of showing individual percents
            You can just show the Percent Bar, and seperate the entire Bar based on the
            percent of the Selections, kind of like how the Elections have theirs.
        */
    
        // If the Total Votes is more than 0 and this poll was set to Show Percent
        if(this.pollData.totalVotes > 0 && this.pollData.viewPercent) {
            let votePct = ((Number(selection.votes) * 100) / Number(this.pollData.totalVotes)).toFixed(2);
            let votePctElement = "<h4 style='text-left'>" + votePct + "%</h4>"

            return "<br><div class='row'><div class ='col'>" + votePctElement + "</div>"
            + "<div class ='col'><div class='progress-bar-striped progress-bar-animated bg-primary' role='progressbar' style='width: " + votePct + "%; height: 2rem; color: blue;' aria-valuenow='" + votePct + "' aria-valuemin='0' aria-valuemax='100'><p style='visibility:hidden'>" + votePct + "</p></div></div>"
            + "</div>";
        }
        return "";
    }

        // This function is used to show the Percents of this Poll.
        showPercentsElementRevised(selection, color) {        
            // If the Total Votes is more than 0 and this poll was set to Show Percent
            if(this.pollData.totalVotes > 0 && this.pollData.viewPercent && selection.votes > 0) {
                var votePct = ((Number(selection.votes) * 100) / Number(this.pollData.totalVotes)).toFixed(2);
    
                return "<div class='progress-bar-striped progress-bar-animated bg-"+color+"' role='progressbar' style='width: " + votePct + "%; height: 3rem; color: blue;' aria-valuenow='" + votePct + "' aria-valuemin='0' aria-valuemax='100'><p class='p-2' style='color: white'>" + votePct + "%</p>"
                + "</div>";
            }
            return "";
        }

        // This function is used to show the Percents of this Poll.
        showPercentsIdx(selection, idx) {        
            let selIdx = this.getSelIndex(idx, 'percent');
            // If the Total Votes is more than 0 and this poll was set to Show Percent
            if(this.pollData.totalVotes > 0 && this.pollData.viewPercent && selection.votes > 0) {
                let votePct = ((Number(selection.votes) * 100) / Number(this.pollData.totalVotes)).toFixed(2);
    
                return "<div style='width: " + votePct + "%;'><div class='col'>"+selIdx+"</div>";
            }
            return "";
        }

    // This function is used to get the Time Frame for Start and End (Time & Date)
    getStartTimeFrame(isStart) { 
        let date;
        let time;
        let labelDate;
        let labelTime;
        let labelColor;

        if (isStart) {
            date = this.pollData.startDate;
            time = this.pollData.startTime;
            labelDate = 'Start Date';
            labelTime = 'Start Time';
            labelColor = 'blue'
        } else {
            date = this.pollData.endDate;
            time = this.pollData.endTime;
            labelDate = 'End Date';
            labelTime = 'End Time';
            labelColor = 'red'
        }

        time = this.checkTime(time);

        return "<div class='row text-center mt-4'>" 
        + "<div class='col-6 border-right'>"
        + "<span class='small text-gray'> <b style='color: "+ labelColor + ";'>" + labelDate + "</b> </span>"
        + "<div class='h5 font-weight-bold mb-0' style='color: "+ labelColor + ";'>" + date + "</div>"
        + "</div>"
        + "<div class='col-6'>"
        + "<span class='small text-gray'><b style='color: "+ labelColor + ";'>" + labelTime + "</b></span>"
        + "<div class='h5 font-weight-bold mb-0' style='color: "+ labelColor + ";'>" + time + "</div>"
        + "</div>"
        + "</div>"
    }

    checkTime(time) {
        let timeFrame = " AM MDT"
        let hour = time[0] + time[1];
        let min = time[3] + time[4];
        hour = Number(hour);
        if (hour == 0) {
            hour = 12;
        }
        if(hour > 12) {
            hour = hour % 12;
            timeFrame = " PM MDT"
        }
        return hour + ":" + min + timeFrame;
    }
}
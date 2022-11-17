import { onSnapshot, query, where } from "firebase/firestore";
import { checkPollDoc, pollsRef } from "./database";
import { noPollsFinishedMessage, noPollsToVoteMessage, noUserCreatedPollsMessage, noVotedOnPollsMessage, signInToViewDash } from "./errorMessage";
import Poll from "./poll";
import { confirmVote } from "./vote";

export default class PollContainer {
    // This is the Constructor to initialize Poll Data Values and Construct Poll Element
    constructor(webPage, email) {
        this.email = email;

        // Keep track of Generated Polls
        this.generatedPolls = 0;

        // Get Query based on Web Page
        switch(webPage) {
            case "pollsPage":
                // Get the Query following the Constraints such as isActive, isOwner
                this.q = query(pollsRef, where("owner", "!=", email));
                this.showOwned = false;
                this.showVoted = false;
                this.showFinished = false;
                this.activeOnBtn = true;
                this.page = "pollsPage"
                break;
            case "myPollsPage":
                this.q = query(pollsRef, where("owner", "==", email));
                this.showOwned = true;
                this.showVoted = false;
                this.page = "myPollsPage"
                console.log("Code hasn't been created yet")
                return;
            case "indexPage":
                this.q = query(pollsRef, where("totalVotes", ">=", 5));
                this.showOwned = true;
                this.showVoted = true;
                this.page = "indexPage"
                console.log("Code hasn't been created yet")
                return;
            default:
                console.log("WebPage doesn't exist in System")
                return;
        }

        
    }

    generatePolls() {
        // Keep track of the writes
        let writes = 1;
        var pollList = new Map();

        // onSnapShot Listener to listen for changes to Documents in the Query
        onSnapshot(this.q, (querySnapshot) => {
            querySnapshot.docChanges().forEach(change => {
                if (this.page == 'indexPage' && !change.doc.data()['public'])
                    return;

                // Check if any of the polls need to be changed to Over
                checkPollDoc(change.doc.data()['startDate'], change.doc.data()['startTime'], change.doc.data()['endDate'], change.doc.data()['endTime'], change.doc.id);
                
                // Let Console know of a Write
                console.log("One Write - Total is now " + writes);

                // Three Categories to keep track of Added, Modified, and Deleted
                if (change.type === "added") {
                    pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                    //this.generatePollListing(change.doc.id, pollList.get(change.doc.id));
                    console.log("New Poll: ", change.doc.data());
                }

                if (change.type === "modified") {
                    pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                    //this.generatePollListing(change.doc.id, pollList.get(change.doc.id));
                    console.log("Modified Poll: ", change.doc.data());
                   
                }

                if (change.type === "removed") {
                    pollList.delete(change.doc.id)
                    //this.generatePollListing(change.doc.id, pollList.get(change.doc.id));
                    console.log("Removed Poll: ", change.doc.data());
                   
                }

                // Increase the Total Writes by 1
                writes++;
            });

            this.pollList = pollList;
            this.displayGeneratedList();
            // Log the Polls Map
            console.log(pollList);
        });
    }

    displayGeneratedList() {
        this.pollList.forEach((value, key) => {
            this.generatePollListing(key, value);
        });
    }

    displayNoPollMessages() {
        switch(this.page) {
            case "pollsPage":
                if (this.generatedPolls == 0 && this.votedOnBtn)  {
                    noVotedOnPollsMessage();
                } else if (this.generatedPolls == 0 && this.activeOnBtn) {
                    noPollsToVoteMessage();   
                } else if (this.generatedPolls == 0 && this.showResultsOnBtn) {
                    noPollsFinishedMessage();   
                }
                break;
            case "myPollsPage":
                if (this.generatedPolls == 0)
                    noUserCreatedPollsMessage();
                break;
        }
    }

    // This function is used to create a individual Poll Listing
    generatePollListing(id, pollItem) {
        let hasVoted = this.checkIfVoted(pollItem, this.email);

        // Get the Poll Listings Element from the Polls HTML Code
        const pollListing = document.getElementById('pollListing');

        // Set Current Poll to a new created Poll using Current User Email, Poll ID and Poll Information from Firebase
        let currPoll = new Poll(this.email, id, pollItem);

        // Get the Voting Buttons of the Current Poll
        let selectBtns = currPoll.getElementsByTagName('button');

        // Go through all Selections of the Current Poll
        pollItem.selections.forEach((selection, idx) => {
            // If Current User isn't a Owner or Hasn't Voted add ability to Vote to Buttons.
            if (pollItem.owner != this.email && !hasVoted && !pollItem.showResults) {
                selectBtns[idx].addEventListener("click", function () { confirmVote(id, selection, idx); });
            }

        })

        // If the Current Poll Element doesn't exist in the Polls HTML CODE add it to the Poll Listing Element
        if (this.showOwned && pollItem.owner == this.email) {
            pollListing.append(currPoll);
            // Increase the number of generated Polls.
            this.generatedPolls++;
        }else if (this.showVoted && hasVoted) {
            pollListing.append(currPoll);
            // Increase the number of generated Polls.
            this.generatedPolls++;   
        } else if (!this.showOwned && !this.showVoted && !this.showResults && !hasVoted && !pollItem.showResults && pollItem.active) {
            pollListing.append(currPoll);
            // Increase the number of generated Polls.
            this.generatedPolls++;  
        }else if (this.showOwned && this.showVoted) {
            pollListing.append(currPoll);
            // Increase the number of generated Polls.
            this.generatedPolls++;
        } else if (!this.showOwned && !this.showVoted && this.showResults && pollItem.showResults && !pollItem.active) {
            pollListing.append(currPoll);
            // Increase the number of generated Polls.
            this.generatedPolls++;  
        }

        // If Generated Poll is 2 then Row limit has been met, create a divider to create new row and a spacer,
        if(this.generatedPolls % 2 == 0 && this.generatedPolls != 0) {
            let divider = document.createElement("div");
            let spacer = document.createElement("br");
            spacer.className = "w-100";
            divider.className = "w-100";
            pollListing.append(divider, spacer);
        }
    }

    // This function is used to check if the Current User has voted.
    checkIfVoted(pollItem, email) {
        let hasVoted = false;
        // Go through all the existing Voters
        pollItem.voters.forEach(voter => {
            // If the current Voter includes the Current User Email then hasVoted else continue to next voter.
            if(Object.values(voter).includes(email))
                hasVoted = true;  
    })

    // None of the voters matches the Current User Email so Current User hasn't voted
    return hasVoted;
    }
  
}
pragma solidity ^0.4.24;

contract CrowdFunding{
    
    //@dev: tracks the state of the crowdfunding process
    enum State {
        Ongoing,
        Failed,
        Succeded,
        PaidOut
    }

    event CampaignFinished(
        address addr,
        uint totalCollected,
        bool suceeded
    );

    string public name;
    uint public targetAmount;
    uint public fundingDeadLine;
    address public beneficiary;
    State public state;
    mapping(address => uint) public amounts; //@dev: to see how much each account deposit
    bool public collected; //@dev: to see if we collected the enough amount of foounds
    uint public totalCollected;

    modifier inState(State expectedState){
        require(state == expectedState, "Invalid state");
        _;
    }

    constructor (
        string contractName,
        uint targetAmountEth,
        uint durationInMin,
        address beneficiaryAddress
    ) public

    {
        name = contractName;
        targetAmount = targetAmountEth * 1 ether;
        fundingDeadLine = currentTime() + durationInMin * 1 minutes;
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
    }


    function contribute() public payable inState(State.Ongoing){
        require(!beforeDeadLine(), "No contributions after the deadline");

        amounts[msg.sender] += msg.value;
        totalCollected += msg.value;

        if(totalCollected >= targetAmount){
            collected = true;
        }

        emit CampaignFinished(this, totalCollected, collected);
    }

    function finishCrowdFunding() public inState(State.Ongoing) {
        require(beforeDeadLine(), "Cannot finish the campaign before the deadline");
        if(!collected) {
            state = State.Failed;
        } else {
            state = State.Succeded;
        }
    }

    function collect() public inState(State.Succeded){
        if(beneficiary.send(totalCollected)){
            state = State.PaidOut;
        }
        else{
            state = State.Failed;
        }
    }

    function withdraw() public inState(State.Failed){
        require(amounts[msg.sender] > 0, "Nothing was contributed");
        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;

        if(!msg.sender.send(contributed)){
            amounts[msg.sender] = contributed;
        }

    }

    function beforeDeadLine() public view returns(bool){
        return currentTime() > fundingDeadLine;
    }

    function currentTime() internal view returns(uint){
        return now;
    }
}
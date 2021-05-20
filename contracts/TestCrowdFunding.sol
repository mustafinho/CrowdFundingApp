pragma solidity ^0.4.24;

import "./CrowdFunding.sol";

contract TestCrowdFunding is CrowdFunding {
    uint256 time;

    constructor(
        string contractName,
        uint256 targetAmountEth,
        uint256 durationInMin,
        address beneficiaryAddress
    )
        CrowdFunding(
            contractName,
            targetAmountEth,
            durationInMin,
            beneficiaryAddress
        )
        public
    {}

    function currentTime() internal view returns (uint256) {
        return time;
    }
    //@dev: sets an artifially current time. ONLY FOR TEST PORPUSES.
    function setCurrentTime(uint256 _newTime) public {
        time = _newTime;
    }
}

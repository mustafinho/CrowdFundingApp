pragma solidity ^0.4.24;

library Utils {
    function etherToWei(uint _sumInEth) public pure returns (uint){
        return _sumInEth * 1 ether;
    }

    function minutesToSeconds(uint _timeInMin) public pure returns(uint){
        return _timeInMin * 1 minutes;
    }
}
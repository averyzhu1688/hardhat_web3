// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AggregatorInterface} from "./AggregatorInterface.sol";
import {AggregatorV3Interface} from "./AggregatorV3Interface.sol";

// solhint-disable-next-line interface-starts-with-i
interface AggregatorV2V3Interface is AggregatorInterface, AggregatorV3Interface {}
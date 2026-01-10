import { ethers } from "ethers";

import MySaleTokenArtifact from "../abi/MySaleToken.json";
import CrowdFundingArtifact from "../abi/CrowdFunding.json";
import SponsorFundingArtifact from "../abi/SponsorFunding.json";
import DistributeFundingArtifact from "../abi/DistributeFunding.json";

export function getToken(address, runner) {
  return new ethers.Contract(address, MySaleTokenArtifact.abi, runner);
}

export function getCrowdFunding(address, runner) {
  return new ethers.Contract(address, CrowdFundingArtifact.abi, runner);
}

export function getSponsorFunding(address, runner) {
  return new ethers.Contract(address, SponsorFundingArtifact.abi, runner);
}

export function getDistributeFunding(address, runner) {
  return new ethers.Contract(address, DistributeFundingArtifact.abi, runner);
}

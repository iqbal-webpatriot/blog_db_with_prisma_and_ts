import blogQueue from "./queue";

async function getActiveJobs() {
    const activeJobs = await blogQueue.getActive();
    console.log("####Active publish bull jobs ",activeJobs.length);
  }
  

  export default getActiveJobs
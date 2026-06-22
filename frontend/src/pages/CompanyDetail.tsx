import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCompanyJobs } from "../api/company";
import type { Opportunity } from "../types/opportunity";

export default function CompanyDetail() {

    const { companyId } =
        useParams();

    const navigate =
        useNavigate();

    const [jobs, setJobs] =
        useState<Opportunity[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const loadJobs =
            async () => {

                try {

                    const data =
                        await getCompanyJobs(
                            companyId!
                        );

                    console.log(
                        "COMPANY JOBS",
                        data
                    );

                    setJobs(data.jobs);

                } catch (error) {

                    console.error(
                        error
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            };

        loadJobs();

    }, [companyId]);

    if (loading) {

        return (
            <h2>
                Loading...
            </h2>
        );
    }

    return (

        <div>

            <h1>
                Opportunities
            </h1>

            {
                jobs.map(
                    job => (

                        <div
                            key={job._id}
                            style={{
                                border:
                                    "1px solid #ddd",
                                padding:
                                    "12px",
                                marginBottom:
                                    "12px",
                                cursor:
                                    "pointer",
                            }}
                            onClick={() =>
                                navigate(
                                    `/opportunities/${job._id}`
                                )
                            }
                        >

                            <h3>
                                {
                                    job.jobRole
                                }
                            </h3>

                            <p>
                                {
                                    job.jobLevel
                                }
                            </p>

                            <p>
                                {
                                    job.status
                                }
                            </p>

                        </div>
                    )
                )
            }

        </div>
    );
}
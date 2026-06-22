import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import type { Company } from "../types/company";

export default function Companies() {

    const [companies, setCompanies] =
        useState<Company[]>([]);

    const navigate =
        useNavigate();

    useEffect(() => {

        const fetchCompanies =
            async () => {

                const response =
                    await api.get(
                        "/api/capture/captured-jobs"
                    );

                setCompanies(
                    response.data.data
                );
            };

        fetchCompanies();

    }, []);

    return (
        <div>

            <h2>Companies</h2>

            {
                companies.map(
                    (company) => (

                        <div
                            key={
                                company._id
                            }
                            onClick={() =>
                                navigate(
                                    `/companies/${company._id}`
                                )
                            }
                        >
                            {company.name}
                        </div>
                    )
                )
            }

        </div>
    );
}
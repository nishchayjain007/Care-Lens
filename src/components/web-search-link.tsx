"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface WebSearchLinkProps {
    medicineName: string;
}

const WebSearchLink = ({ medicineName }: WebSearchLinkProps) => {
    const searchUrl = `https://www.google.com/search?q=${medicineName}`;

    return (
        <Button asChild>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                <Icons.externalLink className="mr-2 h-4 w-4" />
                Search on Google
            </a>
        </Button>
    );
};

export default WebSearchLink;

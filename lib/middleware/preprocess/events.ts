import {Request, Response} from 'express';

class EventPreprocess {
    static readEvents(req: Request, res: Response, next: any) {
        const {projections, ...queryParams} = req.query;
        const {organizers, rSVPs, tags} = queryParams;
        const parsedProjections = projections ? (projections as string).split(',') : undefined;
        const parsedRSVPs = rSVPs ? (rSVPs as string).split(',') : undefined;
        const parsedOrganizers = organizers ? (organizers as string).split(',') : undefined;

        // Add the parsed data to the request object for later use in the controller
        Object.assign(req, {
            parsedQueryParams: {
                ...queryParams,
                ...(parsedProjections && {projections: parsedProjections}),
                ...(parsedOrganizers && {organizers: {$in: parsedOrganizers}}),
                ...(parsedRSVPs && {rSVPs: {$in: parsedRSVPs}}),
            },
        });

        next();
    }
}

export default EventPreprocess;

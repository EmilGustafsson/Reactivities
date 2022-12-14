import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';
import { Activity, ActivityFormValues } from '../models/activity';
import { PaginatedResult } from '../models/pagination';
import { Photo, Profile } from '../models/profile';
import { ServerError } from '../models/serverError';
import { User, UserFormValues } from '../models/user';
import { UserActivity } from '../models/UserActivity';
import { store } from '../stores/store';

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

interface IData {
    errors: any
}

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token) { 
        var h = config?.headers;
        if (h !== undefined)
            h.Authorization = `Bearer ${token}`;
    }
    return config;
})

axios.interceptors.response.use(async response => {
    if (process.env.NODE_ENV === 'development')
    await sleep(1000);
    console.log(response);
    const pagination = response.headers['pagination'];
    
    if (pagination) {
        console.log(pagination);
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        return response as AxiosResponse<PaginatedResult<any>>;
    }
    console.log(response);
    return response;
}, (error: AxiosError) => {
    const {data, status, config} = error.response!;
    const dataobj: IData = data as IData;
    console.log(error.response);
    switch (status) {
        case 400:
            //toast.error('bad request');
            console.log(data);
            console.log(status);
            console.log(dataobj.errors);
            if (typeof data === 'string') {
                toast.error(data);
            }
            if (config.method === 'get' && dataobj.errors.hasOwnProperty('id')) 
            {
                history.push('/not-found');
            }
            if (dataobj.errors) {
                const modalStateError = [];
                for(const key in dataobj.errors) {
                    if (dataobj.errors[key]) {
                        modalStateError.push(dataobj.errors[key]);
                    }
                }
                //console.log(modalStateError);
                //toast.error(modalStateError);
                
                throw modalStateError.flat();
            } else {
                    toast.error("bad request (with unknown type)");
            }
            
            break;
        case 401:
            toast.error('unauthorised');
            break;
        case 404:
            toast.error('not found');
            history.push('/not-found');
            break;
        case 500:
            const ServerErrorData = data as ServerError;
            store.commonStore.setServerError(ServerErrorData);
            history.push('/server-error');

            break;
    }
    return Promise.reject(error);
}) 

/*axios.interceptors.response.use(response => {
    return sleep(1000).then(() => {
        return response;
    }).catch((error) => {
        console.log(error);
        return Promise.reject(error);
    })
})*/ 

const responseBody = <T> (response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    delete: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>('/activities', {params}).then(responseBody),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.delete<void>(`/activities/${id}`),
    attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {})    
}

const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('account/login', user),
    register: (user: UserFormValues) => requests.post<User>('account/register', user)
}

const Profiles = {
    get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        let formData = new FormData();
        formData.append('File', file);
        return axios.post<Photo>('photos', formData, {
            headers: {'Content-type': 'multipart/form-data'}
        })
    }, 
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.delete(`/photos/${id}`),
    updateFollowing: (username: string) => requests.post(`/follow/${username}`,{}),
    listFollowings: (username: string, predicate: string) => requests.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) => requests.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}

const agent = {
    Activities,
    Account,
    Profiles
}

export default agent;
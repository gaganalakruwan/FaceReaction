import { AxiosError, AxiosResponse } from 'axios';
import { Get, Post, Put } from './apiService';
import { Get_React_Types, Save_Reaction } from '../constants/api';

/**
 * Api request to get events
 * @returns {Promise<{ status: boolean, data:[] }>}
 * @throws {Error}
 */

export const getReactionTypesApi = async (): Promise<
  AxiosResponse<any, any>
> => {
  try {
    const response: AxiosResponse<any, any> = await Get(`${Get_React_Types}`);
    return response;
  } catch (error) {
    throw new Error('There is an error loading data, Please try again.');
  }
};
export const saveReactionType = async (
  sendData: any,
): Promise<AxiosResponse<any, any>> => {
  try {
    const response: AxiosResponse<any, any> = await Post(
      `${Save_Reaction}`,
      sendData,
    );
    return response;
  } catch (error) {
    throw new Error('There is an error loading data, Please try again.');
  }
};

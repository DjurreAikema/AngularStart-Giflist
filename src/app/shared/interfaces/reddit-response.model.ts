import {RedditPost} from './reddit-post.model';

export interface RedditResponse {
  data: RedditResponseData;
}

interface RedditResponseData {
  children: RedditPost[];
}

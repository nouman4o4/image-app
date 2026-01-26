export interface IMediaClient {
  title: string
  fileType: string
  description?: string
  mediaUrl: string // could be local path or remote URL
  thumbnailUrl: string
  controles?: boolean
  transformation?: {
    height: number
    width: number
    quality?: number
  }
  uploadedBy: string
  _id?: string
  likes?: string[]
  fileId: string
}

export interface IUserClient {
  _id: string
  firstname: string
  lastname: string
  email: string
  profileImage?: {
    imageUrl: string
    identifier: string
  }
  media?: string[]
  totalLikes?: string[]
  followers?: string[]
  savedMedia?: string[]
  about?: string
  gender?: ""
  following?: string
}

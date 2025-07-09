import { Action, Resource } from '@/enums';

export interface IPermission {
  id: string;
  name: string;
  code: string;
  module: Resource;
  action: Action;
  description?: string;
  is_system?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  module: Resource;
  action: Action;
  description?: string;
  is_system?: boolean;
}

export interface AssignPermissionRequest {
  role_id: string;
  permissions: string[];
}

export interface PermissionResponse {
  data: IPermission[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

export interface PermissionGroup {
  module: Resource;
  permissions: IPermission[];
}

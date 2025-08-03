import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiAssignPermissionOfUser, apiGetPermissions, apiGetPermissionOfUser } from '@/services/admin/permission';
import PermissionTable from '@/components/permissions/PermissionTable';
import { Input } from '@/components/ui/input';
import { apiGetUsers } from '@/services/admin/user';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Loading from '@/components/common/Loading';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';

// Hàm debounce tự viết
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const PermissionUser: React.FC = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [radioValue, setRadioValue] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Số bản ghi mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  // Lấy danh sách quyền của user
  const handleGetPermissionByUser = async (user_id: string) => {
    try {
      setPermissions([]);
      const res: any = await apiGetPermissionOfUser(user_id);
      setPermissions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách quyền');
    }
  };

  // Lấy danh sách users
  const handleGetUsers = async (currentPage: number, query: string = '') => {
    try {
      setIsLoading(true);
      const res: any = await apiGetUsers(currentPage, 'all', query, pageSize);
      setUsers(res.data.data);
      setTotalPages(res.data.metadata.last_page || 1);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách tất cả quyền
  const fetchPermissions = async () => {
    try {
      const { data }: any = await apiGetPermissions();
      setPermissions(data.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách quyền');
    }
  };

  // Debounce cho tìm kiếm
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setPage(1); // Reset về trang 1 khi tìm kiếm
        handleGetUsers(1, query);
      }, 500),
    [],
  );

  // Gọi API khi searchTerm thay đổi
  useEffect(() => {
    if (permissions?.length > 0) {
      setPermissions([]);
      setRadioValue('');
    }
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Gọi fetchPermissions khi component mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  // Xử lý thay đổi quyền
  const handleChangePermission = async (data: string[]) => {
    try {
      if (!radioValue) return;
      const res = await apiAssignPermissionOfUser(radioValue, data);
      if (res.status !== 200) {
        toast.error('Không thể cập nhật quyền');
      } else {
        toast.success('Cập nhật quyền thành công');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể cập nhật quyền');
    }
  };

  // Memoize danh sách RadioGroupItem
  const userItems = useMemo(
    () =>
      users.map((user: any) => (
        <div key={user.id} className="flex items-center gap-3">
          <RadioGroupItem value={user.id} id={user.id} className="cursor-pointer" onClick={() => handleGetPermissionByUser(user.id)} />
          <Label className="text-black" htmlFor={user.id}>
            {user?.name}
          </Label>
        </div>
      )),
    [users],
  );

  // Xử lý chọn trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      handleGetUsers(newPage, searchTerm);
    }
  };

  // Tạo danh sách trang hiển thị với dấu ba chấm
  const getVisiblePages = () => {
    const maxVisiblePages = 5; // Hiển thị tối đa 5 số trang
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả nếu ít trang
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Luôn hiển thị trang 1
    pages.push(1);

    // Tính toán các trang lân cận
    const startPage = Math.max(2, page - 2);
    const endPage = Math.min(totalPages - 1, page + 2);

    // Thêm dấu ba chấm nếu cần
    if (startPage > 2) {
      pages.push('...');
    }

    // Thêm các trang lân cận
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm dấu ba chấm nếu cần
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Luôn hiển thị trang cuối
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="container mx-auto p-4 md:w-full w-[380px] overflow-x-scroll">
      <div className="w-full flex gap-2 flex-col md:flex-row">
        <Card className="w-[350px] p-4 flex flex-col justify-between">
          <div>
            <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-sm mb-4" />
            <RadioGroup value={radioValue} onValueChange={setRadioValue}>
              {isLoading ? <Loading /> : userItems}
            </RadioGroup>
          </div>
          <div className="mt-2">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationPrevious onClick={() => handlePageChange(page - 1)} className={`h-6 w-6 p-0 text-sm ${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
                {getVisiblePages().map((pageNum, index) =>
                  pageNum === '...' ? (
                    <PaginationItem key={`ellipsis-${index}`} className="h-6 w-6 p-0">
                      <PaginationEllipsis className="h-6 w-6 flex items-center justify-center text-sm" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum} className="h-6 w-6 p-0">
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum as number)}
                        isActive={pageNum === page}
                        className={`h-6 w-6 p-0 text-sm flex items-center justify-center ${pageNum === page ? 'bg-blue-500 text-white' : 'cursor-pointer'}`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationNext onClick={() => handlePageChange(page + 1)} className={`h-6 w-6 p-0 text-sm ${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
        <Card className="w-full">
          {permissions?.length > 0 ? (
            <PermissionTable permissions={permissions} handleChangePermission={handleChangePermission} />
          ) : (
            <PermissionTable permissions={[]} handleChangePermission={handleChangePermission} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PermissionUser;

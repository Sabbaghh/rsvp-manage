'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
} from 'lucide-react';

// Data types
type RSVPEntry = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  job_title: string;
  country: string;
  attendance: string;
  hall: string;
};

type Hall = {
  id: number;
  name: string;
  capacity: number;
  availability: number;
};

const VISITORS_API = 'https://ecce.up.railway.app/api/visitors';
const HALLS_API = 'https://ecce.up.railway.app/api/halls';

const hallColors: { [key: string]: string } = {
  'Green Hall': '#27AE60',
  'Purple Hall': '#8E44AD',
  'Yellow Hall': '#F1C40F',
  'Blue Hall': '#3498DB',
};

export default function RSVPManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<RSVPEntry[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [newUser, setNewUser] = useState<Partial<RSVPEntry>>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    department: '',
    job_title: '',
    country: '',
    attendance: '',
    hall: '',
  });

  const fetchHalls = () => {
    axios
      .get(HALLS_API)
      .then((res) => setHalls(res.data))
      .catch((err) => console.error(err));
  };

  const fetchVisitors = () => {
    axios
      .get(VISITORS_API)
      .then((res) => {
        setUsers(
          res.data.map((item: any) => ({
            uid: item.id.toString(),
            name: item.name || '',
            email: item.email || '',
            phone: item.phone || '',
            organization: item.organization || '',
            department: item.department || '',
            job_title: item.job_title || '',
            country: item.country || '',
            attendance: item.attendance === '1' ? 'Confirmed' : 'Pending',
            hall: halls.find((h) => h.id === item.hall)?.name || '',
          })),
        );
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    if (halls.length > 0) {
      fetchVisitors();
    }
  }, [halls]);

  // Filter users by name
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Remove user
  const handleRemove = (uid: string) => {
    axios
      .delete(`${VISITORS_API}/${uid}`)
      .then(() => {
        setUsers(users.filter((user) => user.uid !== uid));
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to delete user');
      });
  };

  const generateSlug = (name: string, hall: string) => {
    const namePart = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    const hallPart = hall
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    return `${namePart}-${hallPart}`;
  };

  const handlePrint = (user: RSVPEntry) => {
    const slug = generateSlug(user.name, user.hall);
    const color = hallColors[user.hall] || '#c8ff00';
    const storedData = { ...user, color };
    localStorage.setItem(`badge-${slug}`, JSON.stringify(storedData));
    console.log('Stored badge data for', slug, storedData);
    router.push(`/badge/${slug}`);
  };

  const handleAddUser = () => {
    if (!newUser.name) {
      alert('Name and email are required');
      return;
    }

    const hallId = halls.find((h) => h.name === newUser.hall)?.id || null;
    const attendanceValue =
      newUser.attendance?.toLowerCase() === 'confirmed' ? '1' : null;

    const body = {
      name: newUser.name,
      email: newUser.email || null,
      phone: newUser.phone || null,
      organization: newUser.organization || null,
      department: newUser.department || null,
      job_title: newUser.job_title || null,
      country: newUser.country || null,
      attendance: attendanceValue,
      hall: hallId,
    };

    axios
      .post(VISITORS_API, body)
      .then((res) => {
        const newItem = res.data;
        const addedUser: RSVPEntry = {
          uid: newItem.id.toString(),
          name: newItem.name || '',
          email: newItem.email || '',
          phone: newItem.phone || '',
          organization: newItem.organization || '',
          department: newItem.department || '',
          job_title: newItem.job_title || '',
          country: newItem.country || '',
          attendance: newItem.attendance === '1' ? 'Confirmed' : 'Pending',
          hall: halls.find((h) => h.id === newItem.hall)?.name || '',
        };

        setUsers([...users, addedUser]);
        setIsDialogOpen(false);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          organization: '',
          department: '',
          job_title: '',
          country: '',
          attendance: '',
          hall: '',
        });

        setTimeout(() => handlePrint(addedUser), 100);
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to add user');
      });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add User Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Enter the details for the new attendee. Name and email are
                  required.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    placeholder="+1-555-0123"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={newUser.organization}
                    onChange={(e) =>
                      setNewUser({ ...newUser, organization: e.target.value })
                    }
                    placeholder="Company Name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) =>
                      setNewUser({ ...newUser, department: e.target.value })
                    }
                    placeholder="Engineering"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={newUser.job_title}
                    onChange={(e) =>
                      setNewUser({ ...newUser, job_title: e.target.value })
                    }
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newUser.country}
                    onChange={(e) =>
                      setNewUser({ ...newUser, country: e.target.value })
                    }
                    placeholder="USA"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="attendance">Attendance</Label>
                  <Input
                    id="attendance"
                    value={newUser.attendance}
                    onChange={(e) =>
                      setNewUser({ ...newUser, attendance: e.target.value })
                    }
                    placeholder="Confirmed"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hall">Hall (Optional)</Label>
                  <Select
                    value={newUser.hall}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, hall: value })
                    }
                  >
                    <SelectTrigger id="hall">
                      <SelectValue placeholder="Select a hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {halls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.name}>
                          {hall.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Hall</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center text-muted-foreground py-8"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.organization}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.job_title}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell>{user.attendance}</TableCell>
                      <TableCell>{user.hall}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.uid}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(user)}
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print badge</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(user.uid)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove user</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="records-per-page"
                className="text-sm text-muted-foreground whitespace-nowrap"
              >
                Rows per page:
              </Label>
              <Select
                value={recordsPerPage.toString()}
                onValueChange={handleRecordsPerPageChange}
              >
                <SelectTrigger id="records-per-page" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredUsers.length)} of{' '}
              {filteredUsers.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="text-sm text-muted-foreground mx-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

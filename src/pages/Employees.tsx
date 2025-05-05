
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore, User } from "@/store/userStore";
import { Plus, Search, Edit, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Employees = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, users, addUser, updateUser, removeUser } = useUserStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "employee" as const,
    position: "",
    category: "Full-Time" as "Intern" | "Full-Time" | "Part-Time" | "Contractor",
  });
  
  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "founder") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  useEffect(() => {
    filterEmployees();
  }, [users, searchQuery]);
  
  const filterEmployees = () => {
    // Only show employees, not founders
    let filtered = users.filter(user => user.role === "employee");
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.name.toLowerCase().includes(query) || 
        employee.email.toLowerCase().includes(query) ||
        (employee.position && employee.position.toLowerCase().includes(query))
      );
    }
    
    setFilteredEmployees(filtered);
  };
  
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Check if email is already in use
    if (users.some(user => user.email === newEmployee.email)) {
      toast({
        title: "Error",
        description: "Email address is already in use",
        variant: "destructive",
      });
      return;
    }
    
    addUser(newEmployee);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Employee added successfully",
    });
    
    // Reset form
    setNewEmployee({
      name: "",
      email: "",
      role: "employee",
      position: "",
      category: "Full-Time",
    });
  };
  
  const handleEditEmployee = () => {
    if (!selectedEmployee || !selectedEmployee.name || !selectedEmployee.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedEmployee.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Check if email is already in use by another user
    if (users.some(user => user.email === selectedEmployee.email && user.id !== selectedEmployee.id)) {
      toast({
        title: "Error",
        description: "Email address is already in use",
        variant: "destructive",
      });
      return;
    }
    
    updateUser(selectedEmployee.id, selectedEmployee);
    setIsEditDialogOpen(false);
    toast({
      title: "Success",
      description: "Employee updated successfully",
    });
  };
  
  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    
    removeUser(selectedEmployee.id);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Success",
      description: "Employee removed successfully",
    });
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 md:w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Add a new employee to your organization.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter employee name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@example.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        placeholder="e.g. Developer, Designer"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEmployee.category}
                        onValueChange={(value: "Intern" | "Full-Time" | "Part-Time" | "Contractor") => 
                          setNewEmployee({ ...newEmployee, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Intern">Intern</SelectItem>
                          <SelectItem value="Full-Time">Full-Time</SelectItem>
                          <SelectItem value="Part-Time">Part-Time</SelectItem>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {filteredEmployees.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">No employees found</p>
            <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
              Add your first employee
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle>{employee.name}</CardTitle>
                  <CardDescription>{employee.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-medium">{employee.position || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {employee.category || "Full-Time"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Edit Employee Dialog */}
        {selectedEmployee && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee information.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedEmployee.name}
                    onChange={(e) => 
                      setSelectedEmployee({ ...selectedEmployee, name: e.target.value })
                    }
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedEmployee.email}
                    onChange={(e) => 
                      setSelectedEmployee({ ...selectedEmployee, email: e.target.value })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-position">Position</Label>
                    <Input
                      id="edit-position"
                      value={selectedEmployee.position || ""}
                      onChange={(e) => 
                        setSelectedEmployee({ ...selectedEmployee, position: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={selectedEmployee.category || "Full-Time"}
                      onValueChange={(value: "Intern" | "Full-Time" | "Part-Time" | "Contractor") => 
                        setSelectedEmployee({ ...selectedEmployee, category: value })
                      }
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditEmployee}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Delete Employee Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedEmployee?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEmployee}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default Employees;

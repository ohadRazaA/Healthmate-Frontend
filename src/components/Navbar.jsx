import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import apiEndPoints, { BASE_URL } from '../constants/apiEndpoints';
import { AuthContext } from '../context api/AuthContext';
import BasicModal from './Modal';
import Input from './Input';
import ButtonCmp from './Button'
import axios from 'axios';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';


function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate();
  const { data, logout, isLoading } = React.useContext(AuthContext);
  const { firstName, type } = data?.data || {};

  // const [form, setForm] = useState({
  //   name: "",
  //   description: "",
  //   image: "",
  //   subCategories: [{ name: "", description: "" }],
  // });

  // const handleChange = useCallback((e, index = null) => {
  //   const { name, value } = e.target;

  //   if (index !== null) {
  //     const subs = [...form.subCategories];
  //     subs[index] = { ...subs[index], [name]: value };
  //     setForm({ ...form, subCategories: subs });
  //   } else {
  //     setForm({ ...form, [name]: value });
  //   }
  // }, [form]);

  // const handleAddSub = useCallback(() => {
  //   setForm({ ...form, subCategories: [...form.subCategories, { name: "", description: "" }] });
  // }, [form]);

  // const isFormValid = useMemo(() => {
  //   if (!form.name.trim()) return false;
  //   const hasInvalidSub = form.subCategories.some(sc => !sc.name.trim());
  //   return !hasInvalidSub;
  // }, [form]);

  // const handleSubmit = useCallback(async () => {
  //   if (!isFormValid) {
  //     toast.error("Please fill required fields (category name and subcategory names)");
  //     return;
  //   }
  //   try {
  //     setIsSubmitting(true);
  //     await axios.post(`${BASE_URL}${apiEndPoints.addLoanCategory}`, form, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
  //     toast.success("Category Added!", {
  //       autoClose: 3000,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true
  //     });
  //     setOpen(false);
  //     setForm({ name: "", description: "", image: "", subCategories: [{ name: "", description: "" }] });
  //   } catch (error) {
  //     const message = error?.response?.data?.message || "Failed to add category";
  //     toast.error(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }, [form, isFormValid]);

  const handleOpenNavMenu = useCallback((event) => {
    setAnchorElNav(event.currentTarget);
  }, []);
  const handleOpenUserMenu = useCallback((event) => {
    setAnchorElUser(event.currentTarget);
  }, []);

  const handleCloseNavMenu = useCallback(() => {
    setAnchorElNav(null);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  const goToDashboard = useCallback(() => {
    navigate(type === 'admin' ? '/admin-dashboard' : '/dashboard');
  }, [navigate, type]);

  return (
    <AppBar sx={{ backgroundColor: 'background.primary' }} position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="button"
            onClick={goToDashboard}
            aria-label="Go to home"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls={Boolean(anchorElNav) ? 'nav-menu-appbar' : undefined}
              aria-expanded={Boolean(anchorElNav) ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="nav-menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/profile'); }}>
                <Typography sx={{ textAlign: 'center' }}>Profile</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="button"
            onClick={goToDashboard}
            aria-label="Go to home"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => { handleCloseNavMenu(); navigate('/profile'); }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Profile
            </Button>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }} aria-label="open user menu" aria-controls={Boolean(anchorElUser) ? 'user-menu-appbar' : undefined} aria-expanded={Boolean(anchorElUser) ? 'true' : undefined} aria-haspopup="true">
                {
                  // !isLoading && <Avatar sx={{ bgcolor: 'background.medium' }} alt={`${firstName || 'User'}`} src="/static/images/avatar/2.jpg" />
                  <Avatar sx={{ bgcolor: 'background.medium' }} alt={`${firstName || 'User'}`} src="/static/images/avatar/2.jpg" />
                }

              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="user-menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <Typography sx={{ textAlign: 'center' }}>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); goToDashboard(); }}>
                <Typography sx={{ textAlign: 'center' }}>Dashboard</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
                <Typography onClick={logout} sx={{ textAlign: 'center' }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
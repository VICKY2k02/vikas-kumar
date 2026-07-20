import { useEffect, useState } from "react";

import {
  Badge,
  IconButton,
  Menu,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

import ListItemButton from "@mui/material/ListItemButton";

import {
  getNotifications,
  markNotificationRead,
  clearNotifications
} from "../../api/notificationApi";

export default function NotificationBell() {

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const loadNotifications = async () => {

    const res = await getNotifications();

    setNotifications(res.data);

  };

useEffect(() => {

    loadNotifications();

    const refresh = async () => {
        const res = await getNotifications();
        setNotifications(res.data);
    };

    window.addEventListener(
        "notification-refresh",
        refresh
    );

    return () => {
        window.removeEventListener(
            "notification-refresh",
            refresh
        );
    };

}, []);

  const unread =
    notifications.filter(n => !n.is_read).length;

  return (

    <>

      <IconButton
        color="inherit"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          loadNotifications();
        }}
      >

        <Badge
          badgeContent={unread}
          color="error"
        >

          <NotificationsIcon />

        </Badge>

      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >

        <Typography
          sx={{
            p: 1,
            fontWeight: "bold"
          }}
        >
          Notifications
        </Typography>

        <List sx={{ width: 350 }}>

          {notifications.length === 0 && (

            <ListItem>

              <ListItemText
                primary="No Notifications"
              />

            </ListItem>

          )}

          {notifications.map((n) => (

            <ListItem
              key={n.id}
              disablePadding
            >

              <ListItemButton
                onClick={async () => {

                  if (!n.is_read) {

                    await markNotificationRead(n.id);

                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === n.id
                          ? { ...item, is_read: true }
                          : item
                      )
                    );
                  }

                }}
              >

                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      {n.message}
                      <br />
                      {n.created_at}
                    </>
                  }
                />

              </ListItemButton>

            </ListItem>

          ))}

        </List>

        <Button
          fullWidth
          color="error"
          onClick={async () => {

            await clearNotifications();

            setNotifications([]);

          }}
        >

          Clear All

        </Button>

      </Menu>

    </>

  );

}
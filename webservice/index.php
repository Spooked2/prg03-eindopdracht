<?php
//Require functions for actions
require_once "includes/actions.php";

//Get data from actions
$data = getSpells();

//Set the header & output JSON so the client will know what to expect.
header("Content-Type: application/json");
echo json_encode($data);
exit;

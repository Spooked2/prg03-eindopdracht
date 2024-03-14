<?php
/**
 * @return array
 */
function getSpells(): array
{

    $db = new PDO('mysql:host=localhost;dbname=paladin_spells', 'root', '');

    $statement = $db->prepare("SELECT * FROM spells");

    $statement->execute();

    return $statement->fetchAll(PDO::FETCH_ASSOC);

}


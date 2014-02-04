<?php
/**
 * Map class
 *
 * Methods for saving map data from XML file to database.
 *
 * And loading from database to associative arrays.
 */
class Map {
    /**
     * Saves XML to database
     *
     * The XML must have a structure like this:
     *
     * <pre>
     * <?xml version="1.0" encoding="utf-8"?>
     * <map>
     *     <towns>
     *         <town>
     *             <id>12</id>
     *             <name>London</name>
     *             <x>137</x>
     *             <y>224</y>
     *         </town>
     *         ...
     *     </towns>
     *     <distancses>
     *         <distance>
     *             <start>12</start>
     *             <end>18</end>
     *             <length>137</length>
     *         </distance>
     *         ...
     *     </distances>
     * </map>
     * </pre>
     *
     * @param string $xml XML document
     */
    public function saveXML($xml) {
        $xmlElement = new SimpleXMLElement($xml);

        // clean up the database
        Map::emptyDatabase();

        // first add towns
        Map::saveTowns($xmlElement->towns);

        // then it's possible to add distances between those towns
        Map::saveDistances($xmlElement->distances);
    }

    /**
     * Removes all records from database
     *
     * NOTE: This might look odd - cleaning up the whole database.
     *
     * But this application is a bit different than an ordinary web-app.
     * This application works with one reletively small document
     * (a simple map with towns and distances), which can be edited
     * in real-time by client and then sent back to server for saving.
     *
     * Because we currently have only one map, then the data of this
     * one map fills the database. We could compare the existing version
     * in database and the sent version, and only save the changes, but
     * this would be a lot more complicated than just cleaning everything
     * up and saving again. It's probably even good performance-wise,
     * as the whole comparison process would require more work then
     * just simply deleting everything.
     *
     * This app could be extended by allowing multiple maps to be edited -
     * then only the towns and distances belonging to a particular map would
     * need to be removed and re-saved.
     */
    private function emptyDatabase() {
        $mdb2 = MDB2::singleton();

        // first delete distances between towns
        $result = $mdb2->query('DELETE FROM distances');
        if (PEAR::isError($result)) { die($result->getMessage()); }

        // only after that can we delete towns themself
        $result = $mdb2->query('DELETE FROM towns');
        if (PEAR::isError($result)) { die($result->getMessage()); }
    }

    /**
     * Saves towns to database
     */
    private function saveTowns(SimpleXMLElement $towns) {
        $mdb2 = MDB2::singleton();

        // prepare insert statement
        $insertTown = $mdb2->prepare(
            'INSERT INTO towns (id, name, x, y) VALUES (?, ?, ?, ?)'
        );

        // insert all towns
        foreach ($towns->children() as $town) {

            $affectedRows = $insertTown->execute( array(
                $town->id,
                $town->name,
                $town->x,
                $town->y,
            ) );

            // exit on error
            if (PEAR::isError($affectedRows)) {
                die($affectedRows->getMessage());
            }
        }
    }

    /**
     * Saves distances to database
     */
    private function saveDistances(SimpleXMLElement $distances) {
        $mdb2 = MDB2::singleton();

        // prepare insert statement
        $insertDistance = $mdb2->prepare(
            'INSERT INTO distances (start, end, length) VALUES (?, ?, ?)'
        );

        // insert all distances
        foreach ($distances->children() as $distance) {

            // do not allow loops
            if ( intval($distance->start) == intval($distance->end) ) {
                die('Distance from town into itself not allowed!');
            }

            // Change the distance direction into somewhat canonical order,
            // so that start town has always smaller ID than end town.
            //
            // This is because we want to consider the distance A-B to be equal
            // to the distance B-A, and when someone tries to insert duplicate
            // distance, we will give an error.
            if ( $distance->start < $distance->end ) {
                $start = $distance->start;
                $end = $distance->end;
            }
            else {
                $end = $distance->start;
                $start = $distance->end;
            }

            $affectedRows = $insertDistance->execute( array(
                $start,
                $end,
                $distance->length,
            ) );

            // exit on error
            if (PEAR::isError($affectedRows)) {
                die($affectedRows->getMessage());
            }
        }
    }

    /**
     * Load all towns from database
     *
     * The returned data will have the following structure:
     *
     * <pre>
     * array(
     *     [0] => array(
     *         "id" => 12,
     *         "name" => "London",
     *         "x" => 137,
     *         "y" => 224,
     *     ),
     *     [1] => array(...),
     *     ...
     * );
     * </pre>
     *
     * @return array of database records
     */
    public function loadTowns() {
        $mdb2 = MDB2::singleton();

        // query all town records to array
        $result = $mdb2->queryAll('SELECT * FROM towns');

        if (PEAR::isError($result)) {
            die($result->getMessage());
        }

        return $result;
    }

    /**
     * Load all distances from database
     *
     * The returned data will have the following structure:
     *
     * <pre>
     * array(
     *     [0] => array(
     *         "start" => 12,
     *         "end" => 18,
     *         "length" => 137,
     *     ),
     *     [1] => array(...),
     *     ...
     * );
     * </pre>
     *
     * @return array of database records
     */
    public function loadDistances() {
        $mdb2 = MDB2::singleton();

        // query all distance records to array
        $result = $mdb2->queryAll('
            SELECT
                v1.id as start_id,
                v1.name as start_name,
                v2.id as end_id,
                v2.name as end_name,
                length
            FROM
                distances JOIN towns v1 ON (start=v1.id)
                      JOIN towns v2 ON (end=v2.id)
            '
        );

        if (PEAR::isError($result)) {
            die($result->getDebugInfo());
        }

        return $result;
    }
}

?>
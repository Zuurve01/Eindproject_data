#!/usr/bin/env python
# Name: Lucas Zuurveld
# Student number: 10220380
'''
This script crawls the IMDB top 250 movies.
'''
# Python standard library imports
import os
import sys
import csv
import codecs
import cStringIO
import errno
import re

# Third party library imports:
import pattern
from pattern.web import URL, DOM, abs, plaintext

# --------------------------------------------------------------------------
# Constants:
FIFA_WORLD_CUP_URL = 'http://www.fifa.com/worldcup/teams/index.html'
OUTPUT_CSV = 'world_cup_players.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Unicode reading/writing functionality for the Python CSV module, taken
# from the Python.org csv module documentation (very slightly adapted).
# Source: http://docs.python.org/2/library/csv.html (retrieved 2014-03-09).

class UTF8Recoder(object):
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")


class UnicodeReader(object):
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        return [unicode(s, "utf-8") for s in row]

    def __iter__(self):
        return self


class UnicodeWriter(object):
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)
# --------------------------------------------------------------------------
# Utility functions (no need to edit):

def create_dir(directory):
    '''
    Create directory if needed.

    Args:
        directory: string, path of directory to be made


    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    '''

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already exising backup directory
            # are not handled, so the exception is re-raised and the 
            # script will crash here.
            raise


def save_csv(filename, rows):
    '''
    Save CSV file with the links to world cup players pages.

    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (all links to player pages)
    '''
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)  # implicitly UTF-8
        writer.writerow([
            'links to player pages'])

        writer.writerows(rows)


def save_csv2(filename, players_infopages):
    '''
    Save CSV file with the information of the players.

    Args:
        filename: string filename for the CSV file
        rows: list player information lines to be saved (all players)
    '''
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)  # implicitly UTF-8
        writer.writerow([
            'country, country abbreviation, name, role, caps, goals, length, first match, birthday, club, country of club abbreviation'])

        for player_page in players_infopages:
            writer.writerows(player_page)

def make_backup(filename, html):
    '''
    Save HTML to file.

    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file

    '''

    with open(filename, 'wb') as f:
        f.write(html)


def main():
    '''
    Crawl the world cup players, save CSV with their information.

    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    '''

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print 'Setting up backup dir if needed ...'
    create_dir(BACKUP_DIR)

    # Make backup of the world cup teams overview page
    print 'Access world cup team overview page, making backup ...'
    fifa_world_cup_url = URL(FIFA_WORLD_CUP_URL)
    fifa_world_cup_html = fifa_world_cup_url.download(cached=True)
    make_backup(os.path.join(BACKUP_DIR, 'index.html'), fifa_world_cup_html)

    # extract the world cup team pages
    print 'Scraping world cup team pages ...'
    url_strings = scrape_world_cup_teams(fifa_world_cup_url)

    # grab all relevant information from world cup players pages
    # Save the urls of players pages in rows
    # Save the information from the players pages in players_infopages
    rows = []
    players_infopages = []

    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print 'Scraping players information of country %d ...' % i
        # Grab web page
        players_html = URL(url).download(cached=True)
        # Append the urls to the players pages into rows
        country_dom = DOM(players_html)
        rows.append(scrape_players_links(country_dom))
        
        # Scrape the information from all the players pages using the urls from rows   
        for j in range(23): # range(23) eigenlijk!
            players_infopages.append(scrape_players_info(rows[i][j]))




    print 'Saving CSVs...'
    # Save a CSV file with the links to all the player pages of the 32 world cup teams (736 urls in total).   
    save_csv(os.path.join(SCRIPT_DIR, 'links_to_player_pages.csv'), rows)


    # Save a CSV file with the players information.
    save_csv2(os.path.join(SCRIPT_DIR, 'world_cup_players.csv'), players_infopages)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:
def scrape_world_cup_teams(url):
    '''
    Scrape the urls to the World Cup team pages.

    Args:
        url: pattern.web.URL instance pointing to the world cup teams overview page

    Returns:
        A list of strings, where each string is the URL to a team page,
        note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    '''

    teams_urls = []

    url = URL("http://www.fifa.com/worldcup/teams/index.html")
    dom = DOM(url.download(cached=True))

    # First element <div> with id="qualifiedteamscontainer"
    for teams in dom('div[id="qualifiedteamscontainer"]')[:1]:
        # Loop over the 32 teams
        for team in teams('li')[:32]: # vervangen door 32!!!
            for link in team.by_tag("a")[:1]:
                # Save the specific link of one team page
                link = link.attrs.get("href","")
                # Convert it to the absolute link
                link = abs(link, base=url.redirect or url.string)
                # Append the link to the list
                teams_urls.append(link)

    # return the list of URLs of each teams page
    return teams_urls



def scrape_players_links(dom):
    '''
    Scrape urls of players pages for a single team

    Args:
        dom: pattern.web.DOM instance representing the page of 1 single
            teampage.

    Returns:
        A list of links to players pages of a country
    '''

    players_urls = []

    url = URL("http://www.fifa.com/")

    # First div element with class="team-players-list" in entry
    for playerlist in dom('div[class="team-players-list"]'):
        # First div element with class="inner" in entry
        for data_url in playerlist('div[class="inner"]'):       
            # Save the relink to the players page
            relink = data_url.attrs.get("data-url","")
            # Convert it to the absolute relink            
            relink = abs(relink, base=url.redirect or url.string)
            # Set it to the url and download it
            relink = URL(str(relink))
            dom_2 = DOM(relink.download(cached=True))

            counter = 0
            # Loop over all the 48 links in the list
            for link_to_player in dom_2.by_tag("a")[:48]:
                # Update counter
                counter +=1
                # Only if the counter is odd update, because every link becomes twice in the html code
                if counter % 2 == 1:
                    # Save the link too the players page
                    link_to_player = link_to_player.attrs.get("href","")
                    # Make the link an absolute link
                    link_to_player = abs(link_to_player, base=url.redirect or url.string)
                    players_urls.append(link_to_player)
    # Return a list of links to the player web_pages
    return players_urls



def scrape_players_info(link):
    '''
    Scrape the information of the players page for a single player

    Args:
        dom: website url of 1 player page

    Returns:
        A list of strings representing the following (in order): name, caps, goals, length,
        birthday, club, country_of_club.
    '''

    url = URL(str(link))
    dom = DOM(url.download(cached=True))

    # Make lists for the return values
    land = []
    land_afkorting = []
    name = []
    role = []
    caps = []
    goals = []
    length = []
    first_one = []
    birthday = []
    club = []
    club_2 = []
    country_of_club = []
    country_of_club_2 = []
    club_and_country = []



    # First <li> element with class="p-team" in entry
    for country_name_1 in dom('li[class="p-team"]'):
        # First <span> element with class="t-nText" in entry
        for country_name_2 in country_name_1('span[class="t-nText"]'):
            land.append(plaintext(country_name_2.content).encode('ascii', 'ignore'))
        # First <span> element with class="t-nTri" in entry
        for country_afkorting in country_name_1('span[class="t-nTri"]'):
             land_afkorting.append(plaintext(country_afkorting.content).encode('ascii', 'ignore'))           
    # First <div> element with class="fdh-wrap contentheader" in entry
    for naambar in dom('div[class="fdh-wrap contentheader"]'):
        for naam_player in naambar('h1'):
            name.append(plaintext(naam_player.content).encode('ascii', 'ignore'))       
    # First <ul> element in entry
    for info_block in dom('ul'):
        # First <li> element in entry with class="role" 
        for player_role in info_block('li[class="role"]'):
            role.append(plaintext(player_role.content).encode('ascii', 'ignore'))
        # First <li> element in entry with class="caps" 
        for player_caps in info_block('li[class="caps"]'):
            # First <span> element in entry with class="data"
            for player_caps_2 in player_caps('span[class="data"]'):
                caps.append(plaintext(player_caps_2.content).encode('ascii', 'ignore'))    
        # First <li> element in entry with class="international-goals" 
        for player_goals in info_block('li[class="international-goals"]'):
            # First <span> element in entry with class="data"
            for player_goals_2 in player_goals('span[class="data"]'):
                goals.append(plaintext(player_goals_2.content).encode('ascii', 'ignore')) 
        # First <li> element in entry with class="height" 
        for player_length in info_block('li[class="height"]'):
            # First <span> element in entry
            for player_length_2 in player_length('span')[:1]:
                length.append(plaintext(player_length_2.content).encode('ascii', 'ignore'))
        # First <li> element in entry with class="first-international" 
        for player_first_one in info_block('li[class="first-international"]'):
            # First <span> element in entry with class="data"
            for player_first_one_2 in player_first_one('span[class="data"]')[:1]:
                first_one.append(plaintext(player_first_one_2.content).encode('ascii', 'ignore'))
        # First <li> element in entry with class="birthdate"                 
        for player_birthdate in info_block('li[class="birthdate"]'):
            # First <span> element in entry with class="data"
            for player_birthdate_2 in player_birthdate('span[class="data"]')[:1]:
                birthday.append(plaintext(player_birthdate_2.content).encode('ascii', 'ignore'))
        # First <li> element in entry with class="clubname"                
        for player_clubname in info_block('li[class="clubname"]'):
            # First <span> element in entry with class="data"
            for player_clubname_2 in player_clubname('span[class="data"]')[:1]:
                club_and_country.append(plaintext(player_clubname_2.content).encode('ascii', 'ignore'))
                club_and_country = club_and_country[0].split("(")
                club = club_and_country[0]
                club_2.append(club)
                country_of_club = club_and_country[1].replace(")", "")
                country_of_club_2.append(country_of_club)

    players_info = []
    players_info = list(zip(land, land_afkorting, name, role, caps, goals, length, first_one, birthday, club_2, country_of_club_2))
    # Return players information
    return players_info

if __name__ == '__main__':
    main()  # call into the progam

    # If you want to test the functions you wrote, you can do that here:
    # ...

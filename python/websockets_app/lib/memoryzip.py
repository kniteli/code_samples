import zipfile
import StringIO

class MemoryZip(object):
    def __init__(self):
        # Create the in-memory file-like object
        self.in_memory_output = StringIO.StringIO()

    def append(self, inzipfilename, data):
        zip = zipfile.ZipFile(self.in_memory_output, 'a')
        zip.writestr(inzipfilename, data)
        zip.close()

    def read(self):
        '''Returns a string with the contents of the in-memory zip.'''
        self.in_memory_output.seek(0)
        return self.in_memory_output.getvalue()

    def writetofile(self, filename):
        '''Writes the in-memory zip to a file.'''
        open(filename, 'wb').write(self.read())
__author__ = 'kohlmannj'

import multiprocessing
import re
import socket
import subprocess
import datetime
from uptime import uptime
from sys import platform as _platform

def get_stats():
    # Use top to get load averages and CPU usage
    if _platform == "linux" or _platform == "linux2":
        command = ['top', '-b', '-n', '1']
    elif _platform == "darwin":
        command = ['top', '-l', '1']
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=None)
    text = p.stdout.read()
    retcode = p.wait()
    if retcode != 0:
        return {}
    # Per the top documentation, we need two samples to get accurate per-process CPU consumption stats.
    # That means we have an extra printout at the start of `text`.
    # Split the output by line.
    # text = text.split("\n")[17:]
    # Use Python to get the reporting time.
    # This is less than ideal (prefer to get time from the output of top),
    # but by using Python we can return an ISO 8601 time stamp (in UTC).
    timestamp = datetime.datetime.utcnow().isoformat()
    avg_loads = re.search(
        r"(Load Avg|load average): (?P<onemin>\d*\.?\d*),\s*(?P<fivemin>\d*\.?\d*),\s*(?P<fifteenmin>\d*\.?\d*)",
        text
    )
    cpu = re.search(
        r"(CPU usage|Cpu\(s\)):\s*(?P<user>\d*\.?\d*(%)?\s*(user|us),\s*(?P<sys>\d*\.?\d*(%)?)\s*(sys|sy),(\s*\d*\.?\d*(%)?\s*ni,)?\s*(?P<idle>\d*\.?\d*(%)?)\s*(idle|id)",
        text
    )

    stats = {
        "avg_load_1min": float(avg_loads.group("onemin")),
        "avg_load_5min": float(avg_loads.group("fivemin")),
        "avg_load_15min": float(avg_loads.group("fifteenmin")),
        "cpu_count": multiprocessing.cpu_count(),
        "cpu_%user": float(cpu.group("user").strip("%")),
        "cpu_%sys":  float(cpu.group("sys").strip("%")),
        "cpu_%idle": float(cpu.group("idle").strip("%")),
        "hostname": socket.gethostname(),
        "timestamp": timestamp,
        "uptime": uptime()
    }

    return stats

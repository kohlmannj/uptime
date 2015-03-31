__author__ = 'kohlmannj'

import multiprocessing
import re
import socket
import subprocess
import datetime
from uptime import uptime


def get_stats():
    # Use top to get load averages, CPU usage, and top 5 CPU-consuming processes
    # command = ['ps', '-xro', 'pid,lstart,time,%cpu,%mem,command']
    command = ['top', '-o', 'cpu', '-l', '2', '-n', '5', '-stats', 'pid,command,cpu']
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=None)
    text = p.stdout.read()
    retcode = p.wait()
    if retcode != 0:
        return {}
    # Per the top documentation, we need two samples to get accurate per-process CPU consumption stats.
    # That means we have an extra printout at the start of `text`.
    # Split the output by line.
    text = text.split("\n")[17:]
    # Use Python to get the reporting time.
    # This is less than ideal (prefer to get time from the output of top),
    # but by using Python we can return an ISO 8601 time stamp (in UTC).
    timestamp = datetime.datetime.now().isoformat()
    load_avgs = re.search(
        r"Load Avg: (?P<onemin>\d*\.?\d*),\s*(?P<fivemin>\d*\.?\d*),\s*(?P<fifteenmin>\d*\.?\d*)",
        text[2]
    )
    cpu = re.search(
        r"CPU usage:\s*(?P<user>\d*\.?\d*%)\s*user,\s*(?P<sys>\d*\.?\d*%)\s*sys,\s*(?P<idle>\d*\.?\d*%)\s*idle",
        text[3]
    )
    proc_keys = re.split("\s+", text[11].lower().strip())
    proc_lines = text[12:]

    stats = {
        "cpu_count": multiprocessing.cpu_count(),
        "cpu_%user": float(cpu.group("user").strip("%")),
        "cpu_%sys":  float(cpu.group("sys").strip("%")),
        "cpu_%idle": float(cpu.group("idle").strip("%")),
        "hostname": socket.gethostname(),
        "load_avg_1min": float(load_avgs.group("onemin")),
        "load_avg_5min": float(load_avgs.group("fivemin")),
        "load_avg_15min": float(load_avgs.group("fifteenmin")),
        "timestamp": timestamp,
        "uptime": uptime()
    }

    # for line in proc_lines:
    #     # Skip empty lines
    #     if len(line.strip()) == 0:
    #         continue
    #     values = re.split("\s+", line.strip())
    #     proc = dict(zip(proc_keys, values))
    #     # String-to-number conversions
    #     if "%cpu" in proc:
    #         proc["%cpu"] = float(proc["%cpu"].strip("%"))
    #     if "pid" in proc:
    #         proc["pid"] = int(proc["pid"].strip("-"))
    #     stats["processes"].append(proc)

    return stats

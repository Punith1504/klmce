import os
import shutil

src = r"c:\Users\punit\OneDrive\Desktop\klmce\frontend\src\app\admin"
dst = r"c:\Users\punit\OneDrive\Desktop\klmce\frontend\src\app\(erp)\admin"

if not os.path.exists(dst):
    os.makedirs(dst)

for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    if os.path.isdir(s):
        if not os.path.exists(d):
            shutil.move(s, d)
        else:
            # If it already exists (like admissions), move contents
            for sub_item in os.listdir(s):
                sub_s = os.path.join(s, sub_item)
                sub_d = os.path.join(d, sub_item)
                if not os.path.exists(sub_d):
                    shutil.move(sub_s, sub_d)
    else:
        if not os.path.exists(d):
            shutil.move(s, d)

shutil.rmtree(src)
print("Merge complete!")
